import { useState, useEffect } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

const EMPTY = { gymName: "", ownerName: "", email: "", password: "", phone: "", address: "", subscriptionPlan: "" };

export default function CreateGymAccount() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    api.get("/admin/plans").then((res) => {
      const p = res.data || [];
      setPlans(p);
      if (p.length) setForm((f) => ({ ...f, subscriptionPlan: p[0].key }));
    });
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 20);
    setForm({ ...form, [name]: value });
    if (name === "email") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setOtpError("");
    }
  };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const sendOtp = async () => {
    if (!form.email) { setOtpError("Please enter email first"); return; }
    if (!isValidEmail(form.email)) { setOtpError("Enter a valid email address"); return; }
    setOtpLoading(true); setOtpError("");
    try {
      await api.post("/otp/send", { email: form.email });
      setOtpSent(true);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) { setOtpError("Please enter OTP"); return; }
    setOtpLoading(true); setOtpError("");
    try {
      const res = await api.post("/otp/verify", { email: form.email, otp });
      if (res.data.success) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) { setError("Please verify email first"); return; }
    if (!form.password) { setError("Please enter a password"); return; }
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await api.post("/admin/create-gym-owner", form);
      setSuccess(`Gym account created! Login credentials sent to ${form.email}.`);
      setForm({ ...EMPTY, subscriptionPlan: plans[0]?.key || "" });
      setOtpSent(false); setOtpVerified(false); setOtp("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const lc = "block text-sm font-medium mb-1.5";
  const ls = { color: "var(--text-muted)" };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
          Add Gym Partner
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Credentials will be emailed to the gym owner automatically
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl p-6" style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Gym Info</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc} style={ls}>Gym Name *</label>
                  <input name="gymName" value={form.gymName} onChange={handleChange} required placeholder="Gym name" className="input-premium" />
                </div>
                <div>
                  <label className={lc} style={ls}>Owner Name *</label>
                  <input name="ownerName" value={form.ownerName} onChange={handleChange} required placeholder="Owner name" className="input-premium" />
                </div>

                {/* Email + OTP */}
                <div className="md:col-span-2">
                  <label className={lc} style={ls}>Owner Email *</label>
                  <div className="flex gap-2">
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange}
                      required placeholder="Email address" className="input-premium flex-1"
                      disabled={otpVerified}
                    />
                    {!otpVerified && (
                      <button type="button" onClick={sendOtp} disabled={otpLoading || !form.email}
                        className="shrink-0 px-4 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(255,90,54,0.12)", color: "var(--brand-orange)", border: "1px solid rgba(255,90,54,0.2)", whiteSpace: "nowrap", opacity: (!form.email || otpLoading) ? 0.5 : 1 }}>
                        {otpLoading && !otpSent ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    )}
                    {otpVerified && (
                      <span className="shrink-0 px-4 rounded-xl text-xs font-semibold flex items-center"
                        style={{ background: "rgba(45,212,196,0.1)", color: "#2DD4C4", border: "1px solid rgba(45,212,196,0.2)" }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP" maxLength={6}
                        className="input-premium flex-1"
                        style={{ letterSpacing: "4px", fontWeight: 700 }}
                      />
                      <button type="button" onClick={verifyOtp} disabled={otpLoading}
                        className="shrink-0 px-4 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4", border: "1px solid rgba(45,212,196,0.2)", whiteSpace: "nowrap" }}>
                        {otpLoading ? "..." : "Verify"}
                      </button>
                    </div>
                  )}
                  {otpError && <p className="text-xs mt-1" style={{ color: "#ff6b6b" }}>{otpError}</p>}
                  {!otpVerified && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>Email verification is required</p>}
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className={lc} style={ls}>Password *</label>
                  <div className="relative">
                    <input
                      name="password" type={showPass ? "text" : "password"}
                      value={form.password} onChange={handleChange}
                      required placeholder="Set password for gym owner" className="input-premium w-full pr-10"
                    />
                    <button type="button" onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: "var(--text-faint)", background: "none", border: "none" }} tabIndex={-1}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>This password will also be sent to the owner's email</p>
                </div>

                <div>
                  <label className={lc} style={ls}>Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number" maxLength={20} className="input-premium" />
                  {form.phone && form.phone.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: form.phone.length >= 20 ? "#ff6b6b" : "var(--text-faint)" }}>
                      {form.phone.length}/20 digits
                    </p>
                  )}
                </div>
                <div>
                  <label className={lc} style={ls}>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="input-premium" />
                </div>
              </div>
            </div>

            {plans.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Subscription Plan</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plans.map((p) => {
                    const active = form.subscriptionPlan === p.key;
                    return (
                      <label key={p.key} className="cursor-pointer rounded-xl p-4 flex flex-col gap-1"
                        style={{ background: active ? "rgba(255,90,54,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(255,90,54,0.35)" : "rgba(255,255,255,0.07)"}` }}>
                        <input type="radio" name="subscriptionPlan" value={p.key} checked={active} onChange={handleChange} className="hidden" />
                        <span className="text-sm font-bold" style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>{p.label}</span>
                        <span className="text-lg font-black" style={{ fontFamily: "var(--font-display)", color: active ? "#FF5A36" : "rgba(255,255,255,0.4)" }}>₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{p.duration} days</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{error}</p>}
            {success && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ color: "#2DD4C4", background: "rgba(45,212,196,0.08)", border: "1px solid rgba(45,212,196,0.2)" }}>✅ {success}</p>}

            <button type="submit" disabled={loading || !otpVerified} className="btn-primary justify-center w-full"
              style={{ opacity: (loading || !otpVerified) ? 0.5 : 1 }}>
              {loading ? "Creating..." : "Create Gym Account →"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
