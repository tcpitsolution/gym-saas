export default function StatCard({ label, value, tone = "default", sublabel }) {
  const tones = {
    default: { border: "rgba(255,255,255,0.08)", accent: "rgba(255,255,255,0.06)", valueColor: "#fff" },
    warn: { border: "rgba(255,90,54,0.25)", accent: "rgba(255,90,54,0.08)", valueColor: "#FF5A36" },
    good: { border: "rgba(45,212,196,0.25)", accent: "rgba(45,212,196,0.08)", valueColor: "#2DD4C4" },
  };

  const t = tones[tone] ?? tones.default;

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{
        background: `linear-gradient(135deg, #16191B, ${t.accent})`,
        border: `1px solid ${t.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        fontFamily: "var(--font-body)",
      }}
    >
      <p className="stat-number" style={{ color: t.valueColor }}>{value}</p>
      <p className="text-sm font-medium mt-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
      {sublabel && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{sublabel}</p>}
    </div>
  );
}
