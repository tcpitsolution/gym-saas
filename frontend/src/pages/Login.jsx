import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { v, validate } from "../utils/validators";
import SEO from "../components/SEO";
import img6 from "../assets/6.png";

const bullets = [
  { icon: "✅", text: "Track attendance in real time." },
  { icon: "💳", text: "Manage payments and dues." },
  { icon: "👥", text: "Keep members and renewals organized." },
];

const testimonial = "Attendance and payments finally organized.";

export default function Login() {
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

  // Forgot password
  const [fpStep, setFpStep] = useState(0); // 0=off 1=email 2=otp 3=newpass
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpPassword, setFpPassword] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpShowPass, setFpShowPass] = useState(false);
  const [fpCountdown, setFpCountdown] = useState(120);
  const fpTimerRef = useRef(null);

  const startFpCountdown = () => {
    setFpCountdown(120);
    if (fpTimerRef.current) clearInterval(fpTimerRef.current);
    fpTimerRef.current = setInterval(() => {
      setFpCountdown((prev) => {
        if (prev <= 1) { clearInterval(fpTimerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (fpTimerRef.current) clearInterval(fpTimerRef.current); }, []);

  const resetFp = () => {
    setFpStep(0); setFpEmail(""); setFpOtp("");
    setFpPassword(""); setFpConfirm(""); setFpError("");
    if (fpTimerRef.current) clearInterval(fpTimerRef.current);
  };

  const handleFpEmailSubmit = async (e) => {
    e.preventDefault();
    setFpError(""); setFpLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: fpEmail });
      setFpStep(2);
      startFpCountdown();
      toast.success("OTP sent to your email");
    } catch (err) {
      setFpError(err.response?.data?.error || "Failed to send OTP");
    } finally { setFpLoading(false); }
  };

  const handleFpOtpSubmit = async (e) => {
    e.preventDefault();
    if (fpOtp.length !== 6) { setFpError("Enter 6-digit OTP"); return; }
    setFpError(""); setFpLoading(true);
    try {
      const res = await api.post("/otp/verify", { email: fpEmail, otp: fpOtp });
      if (!res.data.success) { setFpError(res.data.message || "Invalid OTP"); return; }
      clearInterval(fpTimerRef.current);
      setFpStep(3);
    } catch (err) {
      setFpError(err.response?.data?.error || "OTP verification failed");
    } finally { setFpLoading(false); }
  };

  const handleFpResend = async () => {
    setFpLoading(true); setFpError("");
    try {
      await api.post("/otp/send", { email: fpEmail });
      startFpCountdown(); setFpOtp("");
      toast.success("New OTP sent!");
    } catch { toast.error("Failed to resend OTP"); }
    finally { setFpLoading(false); }
  };

  const handleFpReset = async (e) => {
    e.preventDefault();
    if (fpPassword.length < 6) { setFpError("Password must be at least 6 characters"); return; }
    if (fpPassword !== fpConfirm) { setFpError("Passwords do not match"); return; }
    setFpError(""); setFpLoading(true);
    try {
      await api.post("/auth/reset-password", { email: fpEmail, newPassword: fpPassword });
      toast.success("Password reset! New password sent to your email");
      resetFp();
    } catch (err) {
      setFpError(err.response?.data?.error || "Reset failed");
    } finally { setFpLoading(false); }
  };

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

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate([
      [email, v.email],
      [password, v.password],
    ]);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.otpRequired) {
        setOtpEmail(res.data.email);
        setOtpStep(true);
        startCountdown();
        toast.success("OTP sent to your email 📧");
      } else {
        login(res.data.token);
        // Check role from token
        const payload = JSON.parse(atob(res.data.token.split(".")[1]));
        if (payload.role === "superadmin") {
          window.location.href = "/admin/dashboard";
        } else {
          toast.success("Welcome back! 💪");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-login-otp", { email: otpEmail, otp });
      login(res.data.token);
      toast.success("Welcome back! 💪");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "OTP verification failed";
      setError(msg);
      toast.error(msg);
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
      toast.success("New OTP sent! 📧");
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-body)" }}
    >
      <SEO
        title="Log In — Access Your Gym Dashboard"
        description="Log in to your FlexOps gym management dashboard. Manage members, track attendance, and monitor revenue from one place."
        canonical="/login"
        noindex={false}
      />
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#2DD4C4]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: value content */}
          <div className="hidden lg:block animate-fade-in">
            <Link to="/" className="inline-block mb-10">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: "var(--text-primary)",
                }}
              >
                FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
              </span>
            </Link>

            {/* Tiny badge */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{
                background: "rgba(45,212,196,0.12)",
                color: "var(--brand-teal)",
              }}
            >
              Built for gym owners
            </span>

            <h1
              className="text-4xl leading-[1.15] mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              Manage your gym with one dashboard.
            </h1>
            <p className="text-lg mb-8" style={{ color: "var(--text-muted)" }}>
              Log in to access your gym dashboard, manage members, and track
              revenue in one place.
            </p>

            <div className="space-y-4 mb-10">
              {bullets.map((b) => (
                <div key={b.text} className="flex items-center gap-3">
                  <span className="text-lg">{b.icon}</span>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {b.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Trust strip */}
            <div
              className="flex items-center gap-5 text-xs mb-6"
              style={{ color: "var(--text-faint)" }}
            >
              <span>🔒 Secure login</span>
              <span>⚡ Fast setup</span>
              <span>📈 Trusted by growing gyms</span>
            </div>

            {/* App screenshot */}
            <div
              className="rounded-xl overflow-hidden mb-6"
              style={{
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
              }}
            >
              <img src={img6} alt="App preview" className="w-full h-auto object-cover" />
            </div>

            {/* Testimonial */}
            <p
              className="text-sm italic pb-6"
              style={{ color: "var(--text-faint)" }}
            >
              "{testimonial}"
            </p>
          </div>

          {/* Right: login form (untouched logic) */}
          <div className="w-full max-w-sm mx-auto animate-scale-up">
            {/* Logo — mobile only, since left side is hidden below lg */}
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="inline-block">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    color: "var(--text-primary)",
                  }}
                >
                  FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
                </span>
              </Link>
            </div>

            {/* Mobile fallback — badge + mini benefit strip */}
            <div className="lg:hidden mb-6 text-center">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  background: "rgba(45,212,196,0.12)",
                  color: "var(--brand-teal)",
                }}
              >
                Built for gym owners
              </span>
              <div
                className="flex flex-wrap gap-4 text-xs justify-center"
                style={{ color: "var(--text-faint)" }}
              >
                <span>✅ Attendance</span>
                <span>💳 Payments</span>
                <span>👥 Members</span>
              </div>
            </div>

            <div
              className="rounded-2xl p-8 border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="h-0.5 w-16 rounded-full mb-6"
                style={{ background: "var(--brand-orange)" }}
              />

              {otpStep ? (
                <>
                  <h1
                    className="text-2xl mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                    }}
                  >
                    Verify your email
                  </h1>
                  <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
                    OTP sent to <strong>{otpEmail}</strong>
                  </p>
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        className="input-premium"
                        placeholder="6-digit code"
                        maxLength={6}
                        autoFocus
                      />
                      {/* Countdown timer */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs" style={{ color: countdown === 0 ? "#FF5A36" : "var(--text-faint)" }}>
                          {countdown > 0
                            ? `Expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                            : "OTP expired"}
                        </span>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={countdown > 0 || resendLoading}
                          className="text-xs font-semibold"
                          style={{
                            color: countdown === 0 ? "var(--brand-orange)" : "var(--text-faint)",
                            background: "none",
                            border: "none",
                            cursor: countdown === 0 ? "pointer" : "not-allowed",
                            opacity: resendLoading ? 0.6 : 1,
                          }}
                        >
                          {resendLoading ? "Sending..." : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p
                        className="text-sm px-3 py-2.5 rounded-lg"
                        style={{
                          color: "#ff6b6b",
                          background: "rgba(255,107,107,0.08)",
                          border: "1px solid rgba(255,107,107,0.2)",
                        }}
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full justify-center mt-2"
                      style={{ opacity: loading ? 0.6 : 1 }}
                    >
                      {loading ? "Verifying..." : "Verify OTP →"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpStep(false); setOtp(""); setError(""); }}
                      className="w-full text-sm text-center mt-1"
                      style={{ color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      ← Back to login
                    </button>
                  </form>
                </>
              ) : (
                <>
              <h1
                className="text-2xl mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                }}
              >
                Welcome back
              </h1>
              <p
                className="text-sm mb-7"
                style={{ color: "var(--text-muted)" }}
              >
                Log in to manage your gym
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-premium"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-premium w-full pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: "var(--text-faint)" }}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    className="text-sm px-3 py-2.5 rounded-lg animate-slide-top"
                    style={{
                      color: "#ff6b6b",
                      background: "rgba(255,107,107,0.08)",
                      border: "1px solid rgba(255,107,107,0.2)",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2"
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Logging in..." : "Log in →"}
                </button>

                <button
                  type="button"
                  onClick={() => { setFpStep(1); setError(""); }}
                  className="w-full text-sm text-center mt-3"
                  style={{ color: "var(--brand-orange)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Forgot password?
                </button>
              </form>
                </>
              )}

              {fpStep > 0 && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                  style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                  onClick={resetFp}
                >
                  <div
                    className="w-full max-w-sm rounded-2xl p-8"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "var(--brand-orange)" }} />

                    {fpStep === 1 && (
                      <form onSubmit={handleFpEmailSubmit} className="space-y-4">
                        <h2 className="text-xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Forgot Password</h2>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Enter your registered email address.</p>
                        <input
                          type="email" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
                          required placeholder="Email address" className="input-premium" autoFocus
                        />
                        {fpError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{fpError}</p>}
                        <div className="flex gap-3">
                          <button type="button" onClick={resetFp} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--bg-card-2)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>Cancel</button>
                          <button type="submit" disabled={fpLoading} className="flex-1 btn-primary justify-center" style={{ opacity: fpLoading ? 0.6 : 1 }}>{fpLoading ? "Sending..." : "Send OTP"}</button>
                        </div>
                      </form>
                    )}

                    {fpStep === 2 && (
                      <form onSubmit={handleFpOtpSubmit} className="space-y-4">
                        <h2 className="text-xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Verify OTP</h2>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>OTP sent to <strong style={{ color: "var(--text-primary)" }}>{fpEmail}</strong></p>
                        <input
                          type="text" value={fpOtp}
                          onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6-digit OTP" maxLength={6} className="input-premium" autoFocus
                          style={{ letterSpacing: "4px", fontWeight: 700 }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: fpCountdown === 0 ? "#FF5A36" : "var(--text-faint)" }}>
                            {fpCountdown > 0
                              ? `Expires in ${Math.floor(fpCountdown / 60)}:${String(fpCountdown % 60).padStart(2, "0")}`
                              : "OTP expired"}
                          </span>
                          <button type="button" onClick={handleFpResend} disabled={fpCountdown > 0 || fpLoading}
                            className="text-xs font-semibold"
                            style={{ color: fpCountdown === 0 ? "var(--brand-orange)" : "var(--text-faint)", background: "none", border: "none", cursor: fpCountdown === 0 ? "pointer" : "not-allowed" }}>
                            Resend OTP
                          </button>
                        </div>
                        {fpError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{fpError}</p>}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => { setFpStep(1); setFpError(""); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--bg-card-2)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>Back</button>
                          <button type="submit" disabled={fpLoading} className="flex-1 btn-primary justify-center" style={{ opacity: fpLoading ? 0.6 : 1 }}>{fpLoading ? "Verifying..." : "Verify OTP"}</button>
                        </div>
                      </form>
                    )}

                    {fpStep === 3 && (
                      <form onSubmit={handleFpReset} className="space-y-4">
                        <h2 className="text-xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Set New Password</h2>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Create a new password for your account.</p>
                        <div className="relative">
                          <input
                            type={fpShowPass ? "text" : "password"} value={fpPassword}
                            onChange={(e) => setFpPassword(e.target.value)}
                            required placeholder="New password" className="input-premium w-full pr-10" autoFocus
                          />
                          <button type="button" onClick={() => setFpShowPass((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                            style={{ color: "var(--text-faint)", background: "none", border: "none" }} tabIndex={-1}>
                            {fpShowPass ? "Hide" : "Show"}
                          </button>
                        </div>
                        <input
                          type={fpShowPass ? "text" : "password"} value={fpConfirm}
                          onChange={(e) => setFpConfirm(e.target.value)}
                          required placeholder="Confirm new password" className="input-premium"
                        />
                        {fpError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{fpError}</p>}
                        <button type="submit" disabled={fpLoading} className="btn-primary w-full justify-center" style={{ opacity: fpLoading ? 0.6 : 1 }}>
                          {fpLoading ? "Resetting..." : "Reset Password"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              <div className="glow-divider my-6" />

              <p
                className="text-sm text-center"
                style={{ color: "var(--text-muted)" }}
              >
                Don't have a gym account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold hover:text-[#2DD4C4] transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  Request Demo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
