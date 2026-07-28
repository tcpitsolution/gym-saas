import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { v, validate } from "../../utils/validators";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);
  const { login } = useAuth();

  const startCountdown = () => {
    setCountdown(120);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate([[email, v.email], [password, v.password]]);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const otpVerifiedAt = localStorage.getItem("adminOtpVerifiedAt");
      const res = await api.post("/admin/login", { email, password }, {
        headers: otpVerifiedAt ? { "x-admin-otp-verified": otpVerifiedAt } : {},
      });
      if (res.data.otpRequired) {
        setOtpEmail(res.data.email);
        setOtpStep(true);
        startCountdown();
      } else {
        login(res.data.token);
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await api.post("/admin/verify-login-otp", { email: otpEmail, otp });
      localStorage.setItem("adminOtpVerifiedAt", String(res.data.otpVerifiedAt));
      login(res.data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      await api.post("/otp/send", { email: otpEmail });
      startCountdown();
      setOtp("");
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
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

        <div className="rounded-2xl p-8 border" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <div className="h-0.5 w-16 rounded-full mb-6" style={{ background: "#FF5A36" }} />

          {otpStep ? (
            <>
              <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900 }}>Verify Email</h1>
              <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
                OTP sent to <strong style={{ color: "var(--text-primary)" }}>{otpEmail}</strong>
              </p>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Enter OTP</label>
                  <input
                    type="text" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required className="input-premium" placeholder="6-digit code" maxLength={6} autoFocus
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: countdown === 0 ? "#FF5A36" : "var(--text-faint)" }}>
                      {countdown > 0 ? `Expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}` : "OTP expired"}
                    </span>
                    <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || resendLoading}
                      className="text-xs font-semibold"
                      style={{ color: countdown === 0 ? "var(--brand-orange)" : "var(--text-faint)", background: "none", border: "none", cursor: countdown === 0 ? "pointer" : "not-allowed", opacity: resendLoading ? 0.6 : 1 }}>
                      {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Verifying..." : "Verify OTP →"}
                </button>
                <button type="button" onClick={() => { setOtpStep(false); setOtp(""); setError(""); }}
                  className="w-full text-sm text-center mt-1"
                  style={{ color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer" }}>
                  ← Back to login
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900 }}>Admin Login</h1>
              <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>Access the super admin panel</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium" placeholder="Email address" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-premium w-full pr-10" placeholder="Password" />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-faint)" }} tabIndex={-1}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Logging in..." : "Login →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
