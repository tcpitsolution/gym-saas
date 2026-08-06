import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

const FEATURES = [
  { key: "members",   label: "Members",   icon: "👥" },
  { key: "payments",  label: "Payments",  icon: "💳" },
  { key: "trainers",  label: "Trainers",  icon: "🏋️" },
  { key: "exercises", label: "Exercises", icon: "💪" },
  { key: "askai",     label: "Ask AI",    icon: "🤖" },
  { key: "reports",   label: "Reports",   icon: "📊" },
];

export default function GymAccessControl() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get("/admin/gyms").then((res) => setGyms(res.data)).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleFeature = async (gymId, featureKey, currentVal) => {
    setSaving(`${gymId}_${featureKey}`);
    const gym = gyms.find((g) => g._id === gymId);
    const newFeatures = { ...(gym.features || {}), [featureKey]: !currentVal };
    try {
      await api.patch(`/admin/gyms/${gymId}/features`, { features: newFeatures });
      setGyms((prev) =>
        prev.map((g) => g._id === gymId ? { ...g, features: newFeatures } : g)
      );
      showToast(`${featureKey} ${!currentVal ? "unlocked" : "locked"} for ${gym.name}`);
    } catch {
      showToast("Failed to update", false);
    } finally {
      setSaving(null);
    }
  };

  const toggleAll = async (gymId, enable) => {
    setSaving(`${gymId}_all`);
    const allFeatures = Object.fromEntries(FEATURES.map((f) => [f.key, enable]));
    const gym = gyms.find((g) => g._id === gymId);
    try {
      await api.patch(`/admin/gyms/${gymId}/features`, { features: allFeatures });
      setGyms((prev) =>
        prev.map((g) => g._id === gymId ? { ...g, features: allFeatures } : g)
      );
      showToast(`All features ${enable ? "unlocked" : "locked"} for ${gym.name}`);
    } catch {
      showToast("Failed to update", false);
    } finally {
      setSaving(null);
    }
  };

  const filtered = gyms.filter((g) =>
    !search ||
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.owner?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: toast.ok ? "rgba(45,212,196,0.15)" : "rgba(255,107,107,0.15)", color: toast.ok ? "#2DD4C4" : "#ff6b6b", border: `1px solid ${toast.ok ? "rgba(45,212,196,0.3)" : "rgba(255,107,107,0.3)"}` }}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
            Access Control
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Manage which features each gym owner can access
          </p>
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
        <div className="space-y-4">
          {filtered.map((gym) => {
            const features = gym.features || {};
            const allEnabled = FEATURES.every((f) => features[f.key] !== false);
            const allDisabled = FEATURES.every((f) => features[f.key] === false);
            const isActive = gym.owner?.active !== false;
            const sub = gym.subscription || {};
            const subExpired = sub.endDate && new Date(sub.endDate) < new Date();

            return (
              <div
                key={gym._id}
                className="rounded-2xl p-5"
                style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Gym header */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white text-base">{gym.name}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: isActive ? "rgba(45,212,196,0.12)" : "rgba(255,107,107,0.12)", color: isActive ? "#2DD4C4" : "#ff6b6b" }}
                      >
                        {isActive ? "Active" : "Blocked"}
                      </span>
                      {subExpired && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                          Sub Expired
                        </span>
                      )}
                    </div>
                    {gym.owner && (
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {gym.owner.name} · {gym.owner.email}
                      </p>
                    )}
                  </div>

                  {/* Bulk actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAll(gym._id, true)}
                      disabled={saving === `${gym._id}_all` || allEnabled}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                      style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4", opacity: allEnabled ? 0.4 : 1 }}
                    >
                      Unlock All
                    </button>
                    <button
                      onClick={() => toggleAll(gym._id, false)}
                      disabled={saving === `${gym._id}_all` || allDisabled}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                      style={{ background: "rgba(255,107,107,0.12)", color: "#ff6b6b", opacity: allDisabled ? 0.4 : 1 }}
                    >
                      Lock All
                    </button>
                  </div>
                </div>

                {/* Feature toggles */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {FEATURES.map((f) => {
                    const enabled = features[f.key] !== false;
                    const isSaving = saving === `${gym._id}_${f.key}`;
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleFeature(gym._id, f.key, enabled)}
                        disabled={!!saving}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition"
                        style={{
                          background: enabled ? "rgba(45,212,196,0.08)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${enabled ? "rgba(45,212,196,0.25)" : "rgba(255,255,255,0.08)"}`,
                          color: enabled ? "#2DD4C4" : "rgba(255,255,255,0.35)",
                          cursor: saving ? "not-allowed" : "pointer",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span>{f.icon}</span>
                          {f.label}
                        </span>
                        {isSaving ? (
                          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-xs font-bold">{enabled ? "ON" : "OFF"}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
