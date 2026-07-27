import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { v, validate } from "../../utils/validators";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate([[email, v.email], [password, v.password]]);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      login(res.data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-body)" }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-scale-up">
        <div className="text-center mb-8">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Super Admin Panel</p>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="h-0.5 w-16 rounded-full mb-6" style={{ background: "#FF5A36" }} />
          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900 }}>Admin Login</h1>
          <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>Access the super admin panel</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-premium w-full pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-faint)" }} tabIndex={-1}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm px-3 py-2.5 rounded-lg"
                style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
