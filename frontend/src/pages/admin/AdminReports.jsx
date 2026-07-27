import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

export default function AdminReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/reports").then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data.length) return;
    const headers = ["Gym Name", "Owner Name", "Owner Email", "Owner Phone", "Status", "Subscription Plan", "Sub Status", "Sub Expiry", "Members", "Total Revenue (₹)", "Created On"];
    const rows = data.map((r) => [
      r.gymName, r.ownerName, r.ownerEmail, r.ownerPhone, r.status,
      r.subscriptionPlan, r.subscriptionStatus, r.subscriptionEnd,
      r.memberCount, r.totalRevenue, r.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flexops-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = data.reduce((s, r) => s + (r.totalRevenue || 0), 0);
  const totalMembers = data.reduce((s, r) => s + (r.memberCount || 0), 0);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>Reports</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Full platform overview — all gyms</p>
        </div>
        <button onClick={exportCSV} className="btn-primary" style={{ opacity: data.length ? 1 : 0.5 }}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Gyms",    value: data.length,                                          color: "#FF5A36" },
          { label: "Active Gyms",   value: data.filter((r) => r.status === "Active").length,     color: "#2DD4C4" },
          { label: "Total Members", value: totalMembers,                                         color: "#a78bfa" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`,           color: "#f59e0b" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-5" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: c.color }}>{c.value}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                {["Gym", "Owner", "Status", "Plan", "Sub Expiry", "Members", "Revenue", "Joined"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold whitespace-nowrap"
                    style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td className="px-5 py-3.5 font-medium text-white">{r.gymName}</td>
                  <td className="px-5 py-3.5">
                    <p style={{ color: "rgba(255,255,255,0.8)" }}>{r.ownerName}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{r.ownerEmail}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={r.status === "Active"
                        ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }
                        : { background: "rgba(255,107,107,0.1)", color: "#ff6b6b" }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#f59e0b" }}>{r.subscriptionPlan}</td>
                  <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.4)" }}>{r.subscriptionEnd}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "#a78bfa" }}>{r.memberCount}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "#2DD4C4" }}>₹{(r.totalRevenue || 0).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.3)" }}>{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
