import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Gyms",       value: stats.totalGyms,    color: "#FF5A36" },
    { label: "Active Gyms",      value: stats.activeGyms,   color: "#2DD4C4" },
    { label: "Pending Payments", value: stats.pendingSubs,  color: "#f59e0b" },
    { label: "Total Members",    value: stats.totalMembers, color: "#a78bfa" },
  ] : [];

  const maxCount = stats ? Math.max(...stats.monthlySignups.map((m) => m.count), 1) : 1;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Super admin overview</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl p-4 md:p-5" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: c.color }}>{c.value ?? 0}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="rounded-2xl p-4 md:p-6 mb-6" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs md:text-sm font-semibold mb-4 md:mb-6 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)" }}>
              New Gyms — Last 6 Months
            </p>
            <div className="flex items-end gap-2 md:gap-3" style={{ height: "140px" }}>
              {stats.monthlySignups.map((m) => {
                const heightPct = maxCount === 0 ? 0 : Math.max((m.count / maxCount) * 100, m.count > 0 ? 8 : 0);
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1 md:gap-2">
                    <span className="text-xs font-bold" style={{ color: "#FF5A36" }}>{m.count > 0 ? m.count : ""}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500" style={{
                      height: `${heightPct}%`,
                      minHeight: m.count > 0 ? "8px" : "2px",
                      background: m.count > 0 ? "linear-gradient(180deg, #FF5A36, #ff8c42)" : "rgba(255,255,255,0.06)",
                    }} />
                    <span className="text-[9px] md:text-[10px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue + Gym Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl p-4 md:p-6" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Platform Revenue</p>
              <p className="text-3xl md:text-4xl font-black" style={{ fontFamily: "var(--font-display)", color: "#2DD4C4" }}>
                ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Total collected from all gyms</p>
            </div>
            <div className="rounded-2xl p-4 md:p-6" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Gym Health</p>
              <div className="space-y-2.5">
                {[
                  { label: "Active",              value: stats.activeGyms,                          color: "#2DD4C4" },
                  { label: "Inactive / Blocked",  value: stats.totalGyms - stats.activeGyms,        color: "#ff6b6b" },
                  { label: "Pending Payment",     value: stats.pendingSubs,                         color: "#f59e0b" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center text-sm">
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{r.label}</span>
                    <span className="font-bold text-base" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
