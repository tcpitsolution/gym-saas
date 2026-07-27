import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

const COLORS = ["#FF5A36", "#2DD4C4", "#a78bfa", "#f59e0b", "#34d399"];
const EMPTY = { key: "", label: "", price: "", duration: "", desc: "" };

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null); // plan object being edited
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPlans = () => {
    setLoading(true);
    api.get("/admin/plans").then((res) => setPlans(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openAdd = () => { setEditPlan(null); setForm(EMPTY); setError(""); setShowForm(true); };
  const openEdit = (p) => { setEditPlan(p); setForm({ key: p.key, label: p.label, price: p.price, duration: p.duration, desc: p.desc || "" }); setError(""); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.key || !form.label || !form.price || !form.duration) { setError("All fields required"); return; }
    setSaving(true);
    try {
      if (editPlan) {
        const res = await api.patch(`/admin/plans/${editPlan._id}`, form);
        setPlans((prev) => prev.map((p) => p._id === editPlan._id ? res.data : p));
      } else {
        const res = await api.post("/admin/plans", form);
        setPlans((prev) => [...prev, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete "${plan.label}"?`)) return;
    await api.delete(`/admin/plans/${plan._id}`);
    setPlans((prev) => prev.filter((p) => p._id !== plan._id));
  };

  const lc = "block text-sm font-medium mb-1.5";
  const ls = { color: "var(--text-muted)" };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>Plans</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Manage FlexOps subscription plans for gym owners</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Plan</button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div key={p._id} className="rounded-2xl p-6" style={{ background: "#16191B", border: `1px solid ${color}30` }}>
                <div className="h-0.5 w-10 rounded-full mb-4" style={{ background: color }} />
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {p.duration} days
                    </p>
                    <h2 className="text-lg font-black" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>{p.label}</h2>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={p.active ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" } : { background: "rgba(255,107,107,0.1)", color: "#ff6b6b" }}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-3xl font-black mt-3 mb-1" style={{ fontFamily: "var(--font-display)", color }}>
                  ₹{p.price.toLocaleString("en-IN")}
                </p>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>{p.desc}</p>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>Key: <span style={{ color }}>{p.key}</span></p>

                <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(255,90,54,0.12)", color: "#FF5A36" }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(255,107,107,0.08)", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.15)" }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "#FF5A36" }} />
            <h2 className="text-xl font-black mb-6 text-white" style={{ fontFamily: "var(--font-display)" }}>
              {editPlan ? "Edit Plan" : "Add New Plan"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc} style={ls}>Plan Key *</label>
                  <input
                    value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s/g, "") })}
                    placeholder="e.g. 1month" className="input-premium" disabled={!!editPlan}
                    style={editPlan ? { opacity: 0.5 } : {}}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>Label *</label>
                  <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. 1 Month Plan" className="input-premium" />
                </div>
                <div>
                  <label className={lc} style={ls}>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="999" className="input-premium" />
                </div>
                <div>
                  <label className={lc} style={ls}>Duration (days) *</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" className="input-premium" />
                </div>
              </div>
              <div>
                <label className={lc} style={ls}>Description</label>
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Short description" className="input-premium" />
              </div>

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center" style={{ opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : editPlan ? "Update →" : "Add Plan →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
