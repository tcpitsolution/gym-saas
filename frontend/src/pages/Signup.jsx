import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({ gymName: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/owner/signup", form);
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "gymName", label: "Gym Name", type: "text", placeholder: "Fit Zone Ludhiana" },
    { name: "name", label: "Your Name", type: "text", placeholder: "Rahul" },
    { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 relative overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-body)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#2DD4C4]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-scale-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff" }}>
              FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
            </span>
          </Link>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="h-0.5 w-16 rounded-full mb-6" style={{ background: "var(--brand-teal)" }} />

          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900 }}>
            Create your gym account
          </h1>
          <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
            Start managing your gym today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  placeholder={f.placeholder}
                  className="input-premium"
                />
              </div>
            ))}

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
              {loading ? "Creating account..." : "Sign up →"}
            </button>
          </form>

          <div className="glow-divider my-6" />

          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-white hover:text-[#2DD4C4] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
