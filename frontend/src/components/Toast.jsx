import { useEffect, useState } from "react";

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(45,212,196,0.15)" stroke="#2DD4C4" strokeWidth="1.5" />
      <path d="M7.5 12.5l3 3 6-6" stroke="#2DD4C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(255,107,107,0.15)" stroke="#ff6b6b" strokeWidth="1.5" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L22 20H2L12 3z" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M12 11v5M12 8v.5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const COLORS = {
  success: { border: "rgba(45,212,196,0.25)", bar: "#2DD4C4", text: "#2DD4C4" },
  error:   { border: "rgba(255,107,107,0.25)", bar: "#ff6b6b", text: "#ff6b6b" },
  warning: { border: "rgba(245,158,11,0.25)",  bar: "#f59e0b", text: "#f59e0b" },
  info:    { border: "rgba(96,165,250,0.25)",   bar: "#60a5fa", text: "#60a5fa" },
};

function ToastItem({ id, message, type = "info", duration = 4000, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const c = COLORS[type] || COLORS.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 380);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        background: "rgba(22,25,27,0.97)",
        border: `1px solid ${c.border}`,
        borderRadius: "0.875rem",
        padding: "0.875rem 1rem",
        minWidth: "300px",
        maxWidth: "380px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(110%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? "transform 0.38s cubic-bezier(0.4,0,1,1), opacity 0.38s ease"
          : "transform 0.42s cubic-bezier(0.16,1,0.3,1), opacity 0.42s ease",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
        background: c.bar, borderRadius: "0.875rem 0 0 0.875rem",
      }} />

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, height: "2px",
        background: c.bar, opacity: 0.35, borderRadius: "0 0 0.875rem 0.875rem",
        animation: `toast-shrink ${duration}ms linear forwards`,
      }} />

      <div style={{ marginLeft: "0.5rem", flexShrink: 0, marginTop: "1px" }}>
        {ICONS[type]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.45,
          fontFamily: "var(--font-body)",
          wordBreak: "break-word",
        }}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        style={{
          flexShrink: 0,
          width: "20px", height: "20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.4)",
          fontSize: "0.7rem",
          transition: "background 0.2s, color 0.2s",
          marginTop: "1px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        pointerEvents: "none",
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem {...t} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </>
  );
}
