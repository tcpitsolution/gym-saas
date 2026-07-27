import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";
import { useToast } from "../context/ToastContext";
import { v, validate } from "../utils/validators";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", durationDays: "", price: "" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const fetchPlans = () => {
    api.get("/plans").then((res) => setPlans(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate([
      [form.name, (val) => !val?.trim() ? "Plan name is required" : null],
      [form.durationDays, (val) => !val || Number(val) <= 0 ? "Duration must be greater than 0" : null],
      [form.price, v.amount],
    ]);
    if (err) { setError(err); toast.error(err); return; }
    setAdding(true);
    try {
      await api.post("/plans", { ...form, durationDays: Number(form.durationDays), price: Number(form.price) });
      setForm({ name: "", durationDays: "", price: "" });
      setShowForm(false);
      toast.success("Plan added successfully!");
      fetchPlans();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add plan";
      setError(msg);
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const lc = "block text-sm font-medium mb-1.5";
  const ls = { color: "var(--text-muted)" };

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--text-primary)" }}>Plans</h1>
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>Manage membership plans and pricing</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "Cancel" : "+ Add Plan"}
          </button>
        </div>
      </Animate>

      {showForm && (
        <Animate variant="fadeUp">
          <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "var(--brand-orange)" }} />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={lc} style={ls}>Plan Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Plan name" className="input-premium" />
              </div>
              <div>
                <label className={lc} style={ls}>Duration (Days)</label>
                <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} required placeholder="Duration in days" className="input-premium" />
              </div>
              <div>
                <label className={lc} style={ls}>Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="Price" className="input-premium" />
              </div>
              {error && <p className="md:col-span-3 text-sm px-3 py-2 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{error}</p>}
              <div className="md:col-span-3">
                <button type="submit" disabled={adding} className="btn-primary" style={{ opacity: adding ? 0.6 : 1 }}>
                  {adding ? "Adding..." : "Add Plan →"}
                </button>
              </div>
            </form>
          </div>
        </Animate>
      )}

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: "var(--text-faint)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-faint)" }}>
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>No plans yet.</p>
          <p className="text-sm mt-1">Add your first membership plan.</p>
        </div>
      ) : (
        <Animate variant="fadeUp" delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p, i) => (
              <Animate key={p._id} variant="fadeUp" delay={i * 80}>
                <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">📦</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }}>
                      {p.durationDays} days
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{p.name}</h3>
                  <p className="text-2xl font-black mt-3" style={{ color: "var(--brand-orange)", fontFamily: "var(--font-display)" }}>₹{p.price}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>₹{Math.round(p.price / p.durationDays)}/day</p>
                </div>
              </Animate>
            ))}
          </div>
        </Animate>
      )}
    </Layout>
  );
}
