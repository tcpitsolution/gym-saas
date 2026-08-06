import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "./ConfirmDialog";

const MAX_SIZE_MB = 2;
const MAX_DIM = 500;

export default function MemberDrawer({ member, onClose, onRemoved }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState("");
  const [removing, setRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();

  // Local photo state so UI updates instantly after upload
  const [photo, setPhoto] = useState(member?.photo || null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const libraryInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // NEW: full-size photo viewer state
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  useEffect(() => {
    setPhoto(member?.photo || null);
  }, [member]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (!member) return null;

  const savePhoto = async (dataUrl) => {
    setPhotoUploading(true);
    try {
      await api.patch(`/members/${member._id}`, { photo: dataUrl });
      setPhoto(dataUrl);

      // Face recognition ke liye is photo ka embedding banwao.
      // Photo save ho chuki hai, isliye yeh fail bhi ho to member
      // update poora hi mana jayega — bas face-scan tab tak match nahi karega.
      try {
        const enrollRes = await api.post(`/members/${member._id}/enroll-face`, {
          image: dataUrl,
        });
        if (!enrollRes.data.success) {
          toast.error(
            enrollRes.data.error ||
              "Photo saved, but face not detected clearly",
          );
        } else {
          toast.success("Photo updated");
        }
      } catch {
        toast.success("Photo updated");
        toast.error(
          "Face enrollment failed — attendance scan will not match this photo",
        );
      }

      onRemoved?.(); // reuse existing refresh callback to reload list
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const compressAndSave = (fileOrBlob) => {
    if (fileOrBlob.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB`);
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height && width > MAX_DIM) {
          height = (height * MAX_DIM) / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = (width * MAX_DIM) / height;
          height = MAX_DIM;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        savePhoto(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }
    compressAndSave(file);
    e.target.value = "";
  };

  const openCamera = async () => {
    setCameraError("");
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError("Camera access denied or not available.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        compressAndSave(blob);
        closeCamera();
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setCheckInMsg("");
    try {
      await api.post("/attendance/checkin", { memberId: member._id });
      setCheckInMsg("success");
    } catch (err) {
      setCheckInMsg(err.response?.data?.error || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`/members/${member._id}`);
      toast.success(`${member.name} removed successfully`);
      onClose();
      onRemoved?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove member");
    } finally {
      setRemoving(false);
    }
  };

  const initials = member.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const daysLeft = member.membershipEnd
    ? Math.ceil(
        (new Date(member.membershipEnd) - new Date()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const fields = [
    { label: "Phone", value: member.phone },
    { label: "Email", value: member.email || "—" },
    { label: "Plan", value: member.currentPlan?.name || "—" },
    {
      label: "Ends",
      value: member.membershipEnd
        ? new Date(member.membershipEnd).toLocaleDateString("en-IN")
        : "—",
    },
    { label: "Gender", value: member.gender || "—" },
    { label: "Goal", value: member.goal || "—" },
    { label: "Source", value: member.joinSource || "—" },
    { label: "Emergency", value: member.emergencyContact || "—" },
  ];

  return (
    <>
      {/* Backdrop — no click handler, just visual */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.08)", pointerEvents: "none" }}
      />

      {/* Compact floating card */}
      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: "5%",
          right: "1.5rem",
          width: "320px",
          maxHeight: "80vh",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "1.25rem",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px var(--border-subtle)",
          animation: "scaleUp 0.2s cubic-bezier(0.4,0,0.2,1) both",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            Member Profile
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-xs transition"
            style={{
              background: "var(--bg-card-2)",
              color: "var(--text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              onClick={() => photo && setShowPhotoViewer(true)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 overflow-hidden relative"
              style={
                photo
                  ? {
                      background: "var(--bg-card-2)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }
                  : {
                      background: "linear-gradient(135deg, #FF5A36, #ff8c42)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(255,90,54,0.35)",
                    }
              }
            >
              {photo ? (
                <img
                  src={photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              {photoUploading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-bold truncate"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {member.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={
                    member.status === "active"
                      ? {
                          background: "rgba(45,212,196,0.12)",
                          color: "#2DD4C4",
                        }
                      : {
                          background: "var(--bg-card-2)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  {member.status}
                </span>
                {daysLeft !== null && (
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: daysLeft <= 7 ? "#FF5A36" : "var(--text-faint)",
                    }}
                  >
                    {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo upload buttons */}
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              disabled={photoUploading}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
              style={{
                background: "rgba(255,90,54,0.1)",
                color: "var(--brand-orange)",
              }}
            >
              🖼️ {photo ? "Change" : "Library"}
            </button>
            <button
              type="button"
              onClick={openCamera}
              disabled={photoUploading}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
              style={{ background: "rgba(45,212,196,0.1)", color: "#2DD4C4" }}
            >
              📷 Camera
            </button>
          </div>
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              style={{ background: "#FF5A36", color: "#fff" }}
            >
              {checkingIn ? "..." : "✓ Check In"}
            </button>

            <a
              href={`https://wa.me/91${member.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition"
              style={{ background: "rgba(45,212,196,0.1)", color: "#2DD4C4" }}
            >
              WhatsApp
            </a>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={removing}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              style={{ background: "rgba(255,107,107,0.1)", color: "#ff6b6b" }}
            >
              {removing ? "Removing..." : "Remove"}
            </button>
          </div>

          {checkInMsg && (
            <p
              className="mt-2 text-[11px] px-3 py-1.5 rounded-lg"
              style={{
                background:
                  checkInMsg === "success"
                    ? "rgba(45,212,196,0.12)"
                    : "rgba(255,90,54,0.12)",
                color: checkInMsg === "success" ? "#2DD4C4" : "#FF5A36",
              }}
            >
              {checkInMsg === "success"
                ? "Checked in successfully!"
                : checkInMsg}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-subtle)" }} />

        {/* Scrollable fields */}
        <div className="overflow-y-auto px-4 py-3" style={{ flex: 1 }}>
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex justify-between items-center py-2 text-xs"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span
                style={{
                  color: "var(--text-faint)",
                  flexShrink: 0,
                  marginRight: "0.75rem",
                }}
              >
                {f.label}
              </span>
              <span
                style={{
                  color: "var(--text-primary)",
                  textAlign: "right",
                  wordBreak: "break-word",
                }}
              >
                {f.value}
              </span>
            </div>
          ))}

          {member.notes && (
            <p
              className="mt-3 text-xs p-2.5 rounded-xl leading-relaxed"
              style={{
                background: "var(--bg-card-2)",
                color: "var(--text-muted)",
              }}
            >
              {member.notes}
            </p>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Remove Member"
          message={`Are you sure you want to remove "${member.name}"? This action cannot be undone.`}
          confirmLabel="Remove"
          confirmColor="#ff6b6b"
          onConfirm={() => { setShowConfirm(false); handleRemove(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* NEW: Full-size Photo Viewer Modal */}
      {showPhotoViewer && photo && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setShowPhotoViewer(false)}
        >
          <div
            className="relative"
            style={{ maxWidth: "90vw", maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPhotoViewer(false)}
              className="absolute flex items-center justify-center rounded-full text-sm font-bold transition"
              style={{
                top: "-14px",
                right: "-14px",
                width: "32px",
                height: "32px",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              }}
            >
              ✕
            </button>
            <img
              src={photo}
              alt={member.name}
              className="rounded-2xl"
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                display: "block",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            />
            <p
              className="text-center text-sm font-semibold mt-3"
              style={{ color: "var(--text-primary)" }}
            >
              {member.name}
            </p>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Take Photo
            </h3>
            {cameraError ? (
              <p className="text-sm mb-4" style={{ color: "#ff6b6b" }}>
                {cameraError}
              </p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl mb-4"
                style={{ background: "#000" }}
              />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--bg-card-2)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 btn-primary justify-center"
                >
                  📸 Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
