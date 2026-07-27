import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

const statusColor = { pending: "#f59e0b", approved: "#2DD4C4", rejected: "#ff6b6b" };

export default function DemoRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/demo-requests").then((res) => setRequests(res.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/demo-requests/${id}`, { status });
    setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
          Demo Requests
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          {requests.filter((r) => r.status === "pending").length} pending requests
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>No demo requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="rounded-2xl p-5" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white">{r.gymName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${statusColor[r.status]}20`, color: statusColor[r.status] }}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{r.ownerName} · {r.email} {r.phone && `· ${r.phone}`}</p>
                  {r.message && <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>{r.message}</p>}
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(r._id, "approved")}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{ background: "rgba(45,212,196,0.15)", color: "#2DD4C4" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(45,212,196,0.25)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(45,212,196,0.15)"}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(r._id, "rejected")}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{ background: "rgba(255,107,107,0.12)", color: "#ff6b6b" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,107,107,0.22)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,107,107,0.12)"}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
