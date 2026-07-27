import { useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function MemberDrawer({ member, onClose, onRemoved }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState("");
  const [removing, setRemoving] = useState(false);
  const toast = useToast();

  if (!member) return null;

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
    if (!window.confirm(`Remove member "${member.name}"? This cannot be undone.`)) return;
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
    ? Math.ceil((new Date(member.membershipEnd) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const fields = [
    { label: "Phone", value: member.phone },
    { label: "Email", value: member.email || "—" },
    { label: "Plan", value: member.currentPlan?.name || "—" },
    { label: "Ends", value: member.membershipEnd ? new Date(member.membershipEnd).toLocaleDateString("en-IN") : "—" },
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
          boxShadow: "0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px var(--border-subtle)",
          animation: "scaleUp 0.2s cubic-bezier(0.4,0,0.2,1) both",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
            Member Profile
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-xs transition"
            style={{ background: "var(--bg-card-2)", color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #FF5A36, #ff8c42)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(255,90,54,0.35)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {member.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={
                    member.status === "active"
                      ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }
                      : { background: "var(--bg-card-2)", color: "var(--text-muted)" }
                  }
                >
                  {member.status}
                </span>
                {daysLeft !== null && (
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: daysLeft <= 7 ? "#FF5A36" : "var(--text-faint)" }}
                  >
                    {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
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
              onClick={handleRemove}
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
                background: checkInMsg === "success" ? "rgba(45,212,196,0.12)" : "rgba(255,90,54,0.12)",
                color: checkInMsg === "success" ? "#2DD4C4" : "#FF5A36",
              }}
            >
              {checkInMsg === "success" ? "Checked in successfully!" : checkInMsg}
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
              <span style={{ color: "var(--text-faint)", flexShrink: 0, marginRight: "0.75rem" }}>
                {f.label}
              </span>
              <span style={{ color: "var(--text-primary)", textAlign: "right", wordBreak: "break-word" }}>
                {f.value}
              </span>
            </div>
          ))}

          {member.notes && (
            <p
              className="mt-3 text-xs p-2.5 rounded-xl leading-relaxed"
              style={{ background: "var(--bg-card-2)", color: "var(--text-muted)" }}
            >
              {member.notes}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
