import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";
import TrainerDrawer from "../components/TrainerDrawer";
import { useToast } from "../context/ToastContext";
import { v, validate } from "../utils/validators";

const EMPTY_FORM = {
  name: "", email: "", phone: "", alternatePhone: "",
  address: "", aadharNumber: "", panNumber: "",
  joiningDate: new Date().toISOString().split("T")[0], password: "",
};

const statusTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();

  // OTP states
  const [otpPopup, setOtpPopup] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);

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

  const handleEmailVerify = async () => {
    if (!form.email) return;
    setOtpError("");
    setOtpLoading(true);
    try {
      await api.post("/otp/send", { email: form.email });
      setOtpPopup(true);
      setOtpValue("");
      startCountdown();
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otpValue || otpValue.length !== 6) { setOtpError("Enter 6-digit OTP"); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await api.post("/otp/verify", { email: form.email, otp: otpValue });
      if (res.data.success) {
        setEmailVerified(true);
        setOtpPopup(false);
        clearInterval(timerRef.current);
        toast.success("Email verified! ✅");
      } else {
        setOtpError(res.data.message || "Invalid OTP");
      }
    } catch {
      setOtpError("Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    try {
      await api.post("/otp/send", { email: form.email });
      startCountdown();
      setOtpValue("");
      toast.success("New OTP sent! 📧");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const fetchTrainers = () => {
    setLoading(true);
    api.get("/trainers").then((res) => setTrainers(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrainers(); }, []);

  const filtered = trainers.filter((t) => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.phone?.includes(search);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? t.active : !t.active);
    return matchSearch && matchStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate([
      [form.name, v.name],
      [form.email, v.email],
      [form.phone, v.phone],
      [form.alternatePhone, v.phoneOpt],
      [form.aadharNumber, v.aadhar],
      [form.panNumber, v.pan],
      [form.password, v.password],
    ]);
    if (err) { setError(err); toast.error(err); return; }
    if (!emailVerified) { setError("Please verify email first"); toast.error("Please verify email first"); return; }
    setAdding(true);
    try {
      await api.post("/trainers", form);
      setForm(EMPTY_FORM);
      setEmailVerified(false);
      setShowForm(false);
      toast.success("Trainer added successfully!");
      fetchTrainers();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add trainer";
      setError(msg);
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const lc = "block text-sm font-medium mb-1.5";
  const ls = { color: "var(--text-muted)" };
  const activeCount = trainers.filter((t) => t.active).length;
  const inactiveCount = trainers.length - activeCount;

  return (
    <>
      <Layout>
        <Animate variant="fadeUp">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--text-primary)" }}>Trainers</h1>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>Manage your gym trainers</p>
            </div>
            <button onClick={() => { setShowForm(!showForm); setError(""); }} className="btn-primary">
              {showForm ? "Cancel" : "+ Add Trainer"}
            </button>
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={60}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Trainers", value: trainers.length, color: "var(--text-primary)" },
              { label: "Active", value: activeCount, color: "#2DD4C4" },
              { label: "Inactive", value: inactiveCount, color: "#ff6b6b" },
              { label: "This Month", value: trainers.filter((t) => new Date(t.joiningDate) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length, color: "#FF5A36" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-2xl font-black" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={100}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-card)" }}>
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition"
                  style={statusFilter === tab.key ? { background: "#FF5A36", color: "#fff" } : { color: "var(--text-muted)" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium max-w-sm"
            />
          </div>
        </Animate>

        {showForm && (
          <Animate variant="fadeUp">
            <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "var(--brand-orange)" }} />
              <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Basic Info</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc} style={ls}>Full Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Full name" className="input-premium" />
                  </div>
                  <div>
                    <label className={lc} style={ls}>Email *</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setEmailVerified(false); }}
                        required
                        placeholder="Email address"
                        className="input-premium"
                        style={emailVerified ? { borderColor: "#2DD4C4" } : {}}
                      />
                      {form.email && !emailVerified && (
                        <button
                          type="button"
                          onClick={handleEmailVerify}
                          disabled={otpLoading}
                          className="shrink-0 px-4 rounded-xl text-sm font-semibold"
                          style={{ background: "rgba(255,90,54,0.15)", color: "var(--brand-orange)", border: "1px solid rgba(255,90,54,0.3)", opacity: otpLoading ? 0.6 : 1, whiteSpace: "nowrap" }}
                        >
                          {otpLoading ? "Sending..." : "Verify"}
                        </button>
                      )}
                      {emailVerified && (
                        <span className="shrink-0 flex items-center px-3 rounded-xl text-sm font-semibold" style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4", border: "1px solid rgba(45,212,196,0.2)" }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={lc} style={ls}>Phone *</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} required placeholder="Phone number" maxLength={10} className="input-premium" />
                  </div>
                  <div>
                    <label className={lc} style={ls}>Alternate Phone</label>
                    <input type="text" value={form.alternatePhone} onChange={(e) => setForm({ ...form, alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="Alternate phone number" maxLength={10} className="input-premium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc} style={ls}>Address</label>
                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="input-premium" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Documents & Joining</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={lc} style={ls}>Aadhar Number</label>
                      <input type="text" value={form.aadharNumber} onChange={(e) => setForm({ ...form, aadharNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} placeholder="Aadhar number" maxLength={12} className="input-premium" />
                    </div>
                    <div>
                      <label className={lc} style={ls}>PAN Number</label>
                      <input type="text" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase().slice(0, 10) })} placeholder="PAN number" maxLength={10} className="input-premium" />
                    </div>
                    <div>
                      <label className={lc} style={ls}>Joining Date</label>
                      <input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="input-premium" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Login Credentials</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={lc} style={ls}>Password *</label>
                      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Password" className="input-premium" />
                    </div>
                  </div>
                </div>
                {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>{error}</p>}
                <button type="submit" disabled={adding} className="btn-primary" style={{ opacity: adding ? 0.6 : 1 }}>
                  {adding ? "Adding..." : "Add Trainer →"}
                </button>
              </form>

              {/* OTP Popup */}
              {otpPopup && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                  style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                >
                  <div
                    className="w-full max-w-sm rounded-2xl p-8"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
                  >
                    <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "var(--brand-orange)" }} />
                    <h2 className="text-xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Verify Email</h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                      OTP sent to <strong style={{ color: "var(--text-primary)" }}>{form.email}</strong>
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Enter OTP</label>
                      <input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6-digit code"
                        maxLength={6}
                        autoFocus
                        className="input-premium"
                      />
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
                          style={{ color: countdown === 0 ? "var(--brand-orange)" : "var(--text-faint)", background: "none", border: "none", cursor: countdown === 0 ? "pointer" : "not-allowed", opacity: resendLoading ? 0.6 : 1 }}
                        >
                          {resendLoading ? "Sending..." : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                    {otpError && (
                      <p className="text-sm px-3 py-2 rounded-lg mb-4" style={{ color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}>
                        {otpError}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setOtpPopup(false); clearInterval(timerRef.current); }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: "var(--bg-card-2)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleOtpVerify}
                        disabled={otpLoading}
                        className="flex-1 btn-primary justify-center"
                        style={{ opacity: otpLoading ? 0.6 : 1 }}
                      >
                        {otpLoading ? "Verifying..." : "Verify →"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Animate>
        )}

        {loading ? (
          <div className="flex items-center gap-3" style={{ color: "var(--text-faint)" }}>
            <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <Animate variant="fadeUp">
            <div className="text-center py-20" style={{ color: "var(--text-faint)" }}>
              <p className="text-5xl mb-4">🏋️</p>
              <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>No trainers found.</p>
              <p className="text-sm mt-1">Try a different filter or add a new trainer.</p>
            </div>
          </Animate>
        ) : (
          <Animate variant="fadeUp" delay={200}>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card-2)" }}>
                    {["Trainer", "Phone", "Joining Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 font-semibold"
                        style={{ color: "var(--text-faint)", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id} onClick={() => setSelectedTrainer(t)}
                      className="cursor-pointer transition-colors duration-150"
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 font-bold"
                            style={{ background: "linear-gradient(135deg,#FF5A36,#ff8c42)", color: "#fff", fontSize: "0.7rem" }}>
                            {t.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-faint)" }}>{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{t.phone || "—"}</td>
                      <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>
                        {t.joiningDate ? new Date(t.joiningDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={t.active
                            ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }
                            : { background: "rgba(255,107,107,0.1)", color: "#ff6b6b" }}>
                          {t.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Animate>
        )}
      </Layout>

      {selectedTrainer && (
        <TrainerDrawer trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} onRemoved={fetchTrainers} />
      )}
    </>
  );
}
