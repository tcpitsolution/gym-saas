import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

const PLANS = [
  { key: "1month",  label: "1 Month  — ₹999" },
  { key: "3month",  label: "3 Months — ₹2,499" },
  { key: "1year",   label: "1 Year   — ₹7,999" },
];

export default function AdminSubscriptions() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("1month");
  const [planLoading, setPlanLoading] = useState(false);

  const fetchPending = () => {
    setLoading(true);
    api.get("/admin/subscriptions/pending").then((res) => setGyms(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handlePlanChange = async () => {
    setPlanLoading(true);
    try {
      await api.patch(`/admin/gyms/${planModal.gymId}/subscription`, { plan: selectedPlan });
      setPlanModal(null);
      fetchPending();
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
          Pending Payments
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Gyms with expired or missing subscriptions
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : gyms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-medium text-white">All subscriptions are active!</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>No pending payments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gyms.map((gym) => {
            const sub = gym.subscription || {};
            const isExpired = sub.endDate && new Date(sub.endDate) < new Date();
            return (
              <div key={gym._id} className="rounded-2xl p-5" style={{ background: "#16191B", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-white text-lg">{gym.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: isExpired ? "rgba(255,107,107,0.12)" : "rgba(245,158,11,0.12)", color: isExpired ? "#ff6b6b" : "#f59e0b" }}>
                        {isExpired ? "Expired" : "Pending"}
                      </span>
                    </div>
                    {gym.owner && (
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Owner: <span className="text-white font-medium">{gym.owner.name}</span> · {gym.owner.email}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {sub.endDate && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Expired on: <span style={{ color: "#ff6b6b" }}>{new Date(sub.endDate).toLocaleDateString("en-IN")}</span>
                        </p>
                      )}
                      {sub.plan && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Last plan: <span style={{ color: "#f59e0b" }}>{sub.plan}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {gym.owner?.phone && (
                      <a href={`https://wa.me/91${gym.owner.phone}`} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}>
                        WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => { setPlanModal({ gymId: gym._id, gymName: gym.name }); setSelectedPlan(sub.plan || "1month"); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(255,90,54,0.15)", color: "#FF5A36" }}>
                      Activate Plan
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "#FF5A36" }} />
            <h2 className="text-xl font-black mb-1 text-white" style={{ fontFamily: "var(--font-display)" }}>Activate Subscription</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>{planModal.gymName}</p>
            <div className="space-y-2 mb-6">
              {PLANS.map((p) => (
                <label key={p.key} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                  style={{ background: selectedPlan === p.key ? "rgba(255,90,54,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedPlan === p.key ? "rgba(255,90,54,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                  <input type="radio" name="plan" value={p.key} checked={selectedPlan === p.key} onChange={() => setSelectedPlan(p.key)} />
                  <span className="text-sm font-medium" style={{ color: selectedPlan === p.key ? "#fff" : "rgba(255,255,255,0.5)" }}>{p.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPlanModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                Cancel
              </button>
              <button onClick={handlePlanChange} disabled={planLoading} className="flex-1 btn-primary justify-center" style={{ opacity: planLoading ? 0.6 : 1 }}>
                {planLoading ? "Activating..." : "Activate →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
