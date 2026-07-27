export default function StatCard({ label, value, tone = "default", sublabel }) {
  const tones = {
    default: { border: "var(--border-subtle)", valueColor: "var(--text-primary)" },
    warn:    { border: "rgba(255,90,54,0.25)",  valueColor: "#FF5A36" },
    good:    { border: "rgba(45,212,196,0.25)", valueColor: "#2DD4C4" },
  };

  const t = tones[tone] ?? tones.default;

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${t.border}`,
        boxShadow: "var(--shadow-card)",
        fontFamily: "var(--font-body)",
      }}
    >
      <p className="stat-number" style={{ color: t.valueColor }}>{value}</p>
      <p className="text-sm font-medium mt-1.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      {sublabel && <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{sublabel}</p>}
    </div>
  );
}
