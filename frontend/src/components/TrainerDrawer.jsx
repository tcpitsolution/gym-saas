import { useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "./ConfirmDialog";

export default function TrainerDrawer({ trainer, onClose, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();

  if (!trainer) return null;

  const initials = trainer.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`/trainers/${trainer._id}`);
      toast.success(`${trainer.name} removed successfully`);
      onClose();
      onRemoved?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove trainer");
    } finally {
      setRemoving(false);
    }
  };

  const fields = [
    { label: "Email",           value: trainer.email || "—" },
    { label: "Phone",           value: trainer.phone || "—" },
    { label: "Alternate Phone", value: trainer.alternatePhone || "—" },
    { label: "Address",         value: trainer.address || "—" },
    { label: "Aadhar Number",   value: trainer.aadharNumber || "—" },
    { label: "PAN Number",      value: trainer.panNumber || "—" },
    { label: "Joining Date",    value: trainer.joiningDate ? new Date(trainer.joiningDate).toLocaleDateString("en-IN") : "—" },
    { label: "Added On",        value: trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString("en-IN") : "—" },
  ];

  return (
    <>
      {/* Backdrop */}
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
            Trainer Profile
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
                {trainer.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={
                    trainer.active
                      ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }
                      : { background: "var(--bg-card-2)", color: "var(--text-muted)" }
                  }
                >
                  {trainer.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <a
              href={`https://wa.me/91${trainer.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition"
              style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}
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
        </div>
      </div>
      {showConfirm && (
        <ConfirmDialog
          title="Remove Trainer"
          message={`Are you sure you want to remove "${trainer.name}"? This action cannot be undone.`}
          confirmLabel="Remove"
          confirmColor="#ff6b6b"
          onConfirm={() => { setShowConfirm(false); handleRemove(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
