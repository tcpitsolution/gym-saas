import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

export default function ManageGyms() {
  const [gyms, setGyms] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planModal, setPlanModal] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  const fetchGyms = () => {
    setLoading(true);
    api.get("/admin/gyms").then((res) => setGyms(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGyms();
    api.get("/admin/plans").then((res) => setPlans(res.data || []));
  }, []);

  const filtered = gyms.filter((g) =>
    !search ||
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.owner?.email?.toLowerCase().includes(search.toLowerCase()) ||
    g.owner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (gymId, currentActive) => {
    await api.patch(`/admin/gyms/${gymId}/toggle`);
    setGyms((prev) => prev.map((g) => g._id === gymId ? { ...g, owner: { ...g.owner, active: !currentActive } } : g));
  };

  const handleDelete = async (gymId, gymName) => {
    if (!window.confirm(`Remove "${gymName}" permanently? This cannot be undone.`)) return;
    await api.delete(`/admin/gyms/${gymId}`);
    setGyms((prev) => prev.filter((g) => g._id !== gymId));
  };

  const openPlanModal = (gym) => {
    setPlanModal({ gymId: gym._id, gymName: gym.name });
    setSelectedPlan(gym.subscription?.plan || (plans[0]?.key || ""));
  };

  const handlePlanChange = async () => {
    setPlanLoading(true);
    try {
      const res = await api.patch(`/admin/gyms/${planModal.gymId}/subscription`, { plan: selectedPlan });
      setGyms((prev) => prev.map((g) => g._id === planModal.gymId ? { ...g, subscription: res.data.subscription } : g));
      setPlanModal(null);
    } finally {
      setPlanLoading(false);
    }
  };

  const subColor = (status) => {
    if (status === "active")  return { bg: "rgba(45,212,196,0.12)",  color: "#2DD4C4" };
    if (status === "expired") return { bg: "rgba(255,107,107,0.12)", color: "#ff6b6b" };
    return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" };
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>Manage Gyms</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{gyms.length} gyms registered</p>
        </div>
        <input
          type="text"
          placeholder="Search gym / owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-premium max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>No gyms found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((gym) => {
            const isActive = gym.owner?.active !== false;
            const sub = gym.subscription || {};
            const sc = subColor(sub.status);
            return (
              <div key={gym._id} className="rounded-2xl p-5" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-white text-lg">{gym.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: isActive ? "rgba(45,212,196,0.15)" : "rgba(255,107,107,0.12)", color: isActive ? "#2DD4C4" : "#ff6b6b" }}>
                        {isActive ? "Active" : "Blocked"}
                      </span>
                      {sub.status && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}>
                          Sub: {sub.status}
                        </span>
                      )}
                    </div>

                    {gym.owner && (
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Owner: <span className="text-white font-medium">{gym.owner.name}</span> · {gym.owner.email}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Members: <span style={{ color: "rgba(255,255,255,0.6)" }}>{gym.memberCount ?? 0}</span>
                      </p>
                      {sub.plan && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Plan: <span style={{ color: "#f59e0b" }}>{sub.plan}</span>
                        </p>
                      )}
                      {sub.endDate && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Expires: <span style={{ color: new Date(sub.endDate) < new Date() ? "#ff6b6b" : "rgba(255,255,255,0.5)" }}>
                            {new Date(sub.endDate).toLocaleDateString("en-IN")}
                            {new Date(sub.endDate) < new Date() ? " ⚠️ Expired" : ""}
                          </span>
                        </p>
                      )}
                      {!sub.endDate && (
                        <p className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,107,107,0.12)", color: "#ff6b6b" }}>
                          ❌ No Payment
                        </p>
                      )}
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Joined: {new Date(gym.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {gym.owner?.phone && (
                      <a
                        href={`https://wa.me/91${gym.owner.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => openPlanModal(gym)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
                    >
                      Change Plan
                    </button>
                    <button
                      onClick={() => toggleStatus(gym._id, isActive)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: isActive ? "rgba(255,107,107,0.12)" : "rgba(45,212,196,0.15)", color: isActive ? "#ff6b6b" : "#2DD4C4" }}
                    >
                      {isActive ? "Block" : "Unblock"}
                    </button>
                    <button
                      onClick={() => handleDelete(gym._id, gym.name)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(255,107,107,0.08)", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.2)" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Change Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "#FF5A36" }} />
            <h2 className="text-xl font-black mb-1 text-white" style={{ fontFamily: "var(--font-display)" }}>Change Subscription</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>{planModal.gymName}</p>

            <div className="space-y-2 mb-6">
              {plans.map((p) => (
                <label key={p.key} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                  style={{ background: selectedPlan === p.key ? "rgba(255,90,54,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedPlan === p.key ? "rgba(255,90,54,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                  <input type="radio" name="plan" value={p.key} checked={selectedPlan === p.key} onChange={() => setSelectedPlan(p.key)} />
                  <span className="text-sm font-medium" style={{ color: selectedPlan === p.key ? "#fff" : "rgba(255,255,255,0.5)" }}>
                    {p.label} — ₹{p.price.toLocaleString("en-IN")} / {p.duration} days
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPlanModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                Cancel
              </button>
              <button onClick={handlePlanChange} disabled={planLoading} className="flex-1 btn-primary justify-center" style={{ opacity: planLoading ? 0.6 : 1 }}>
                {planLoading ? "Saving..." : "Apply →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
