import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";

export default function AddMember() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", planId: "",
    startDate: new Date().toISOString().split("T")[0],
    amount: "", mode: "cash",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api.get("/plans").then((res) => setPlans(res.data)); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/members", form);
      navigate("/members");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-premium";
  const labelClass = "block text-sm font-medium mb-1.5";
  const labelStyle = { color: "rgba(255,255,255,0.5)" };

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "Rahul Sharma" },
    { name: "phone", label: "Phone", type: "text", placeholder: "9876543210" },
    { name: "email", label: "Email (optional)", type: "email", placeholder: "rahul@example.com", required: false },
  ];

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="mb-8">
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
            Add Member
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Register a new gym member</p>
        </div>
      </Animate>

      <Animate variant="fadeUp" delay={100}>
        <div
          className="max-w-lg rounded-2xl p-8"
          style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}
        >
          <div className="h-0.5 w-12 rounded-full mb-7" style={{ background: "var(--brand-orange)" }} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f, i) => (
              <Animate key={f.name} variant="fadeUp" delay={i * 60}>
                <div>
                  <label className={labelClass} style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={f.required !== false}
                    placeholder={f.placeholder}
                    className={inputClass}
                  />
                </div>
              </Animate>
            ))}

            <Animate variant="fadeUp" delay={180}>
              <div>
                <label className={labelClass} style={labelStyle}>Plan</label>
                <select
                  name="planId"
                  value={form.planId}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={{ cursor: "pointer" }}
                >
                  <option value="" style={{ background: "#16191B" }}>Select a plan</option>
                  {plans.map((p) => (
                    <option key={p._id} value={p._id} style={{ background: "#16191B" }}>
                      {p.name} — ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>
            </Animate>

            <Animate variant="fadeUp" delay={240}>
              <div>
                <label className={labelClass} style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </Animate>

            <Animate variant="fadeUp" delay={300}>
              <div>
                <label className={labelClass} style={labelStyle}>Amount Paid (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  placeholder="1000"
                  className={inputClass}
                />
              </div>
            </Animate>

            <Animate variant="fadeUp" delay={360}>
              <div>
                <label className={labelClass} style={labelStyle}>Payment Mode</label>
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ cursor: "pointer" }}
                >
                  {["cash", "upi", "card", "online"].map((m) => (
                    <option key={m} value={m} style={{ background: "#16191B", textTransform: "capitalize" }}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </Animate>

            {error && (
              <p className="text-sm px-3 py-2.5 rounded-lg animate-slide-top"
                style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Adding..." : "Add Member →"}
            </button>
          </form>
        </div>
      </Animate>
    </Layout>
  );
}
