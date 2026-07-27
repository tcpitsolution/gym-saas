import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { v, validate } from "../utils/validators";

const benefits = [
  {
    icon: "⏱️",
    title: "Save time with automated attendance",
    desc: "Check-ins tracked automatically, no more paper registers.",
  },
  {
    icon: "💳",
    title: "Track payments and dues in one place",
    desc: "See who's paid, who's pending, and who's overdue instantly.",
  },
  {
    icon: "👥",
    title: "Manage members and renewals easily",
    desc: "Add members, assign plans, and never miss a renewal date.",
  },
  {
    icon: "📊",
    title: "Get clear business insights instantly",
    desc: "Revenue trends, attendance patterns, at-risk members — all visible.",
  },
];

const faqs = [
  {
    q: "How long does setup take?",
    a: "Under 5 minutes. Create your account, add your first members, and you're running.",
  },
  {
    q: "Is my data secure?",
    a: "Yes — your gym's data is isolated and only accessible with your login.",
  },
  {
    q: "Can I access it on mobile?",
    a: "Yes, the dashboard works on any browser, including mobile.",
  },
];

export default function RequestDemo() {
  const [form, setForm] = useState({
    gymName: "",
    ownerName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") val = value.replace(/\D/g, "").slice(0, 10);
    setForm({ ...form, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate([
      [form.gymName, (val) => (!val?.trim() ? "Gym name is required" : null)],
      [form.ownerName, v.name],
      [form.email, v.email],
      [form.phone, v.phoneOpt],
    ]);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/demo-request", form);
      toast.success("Demo request submitted! We'll contact you soon.");
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Request failed. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-body)" }}
    >
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#2DD4C4]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top nav */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8">
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

      {/* Hero + Form section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: hero + benefits + screenshot */}
        <div className="animate-fade-in">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--brand-teal)" }}
          >
            Built for Indian Gym Owners
          </p>
          <h1
            className="text-4xl md:text-5xl leading-[1.1] mb-5"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              color: "var(--text-primary)",
            }}
          >
            Run your gym smarter.
          </h1>
          <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
            All-in-one gym management for modern fitness businesses — members,
            billing, attendance, and reports in a single dashboard.
          </p>

          {/* Screenshot placeholder */}
          <div
            className="rounded-2xl p-5 mb-10 border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  430
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-faint)" }}
                >
                  Active Members
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--brand-teal)" }}
                >
                  ₹1.2L
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-faint)" }}
                >
                  Revenue (30d)
                </p>
              </div>
            </div>
            <div
              className="rounded-xl p-4 h-24 flex items-end gap-2"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: "var(--brand-orange)",
                    opacity: 0.5 + i * 0.07,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-5 mb-10">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4">
                <span className="text-xl shrink-0">{b.icon}</span>
                <div>
                  <p
                    className="font-semibold text-sm mb-0.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {b.title}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-faint)" }}
            >
              Trusted by fitness studios
            </p>
            <p
              className="text-sm italic mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              "Switched from paper registers to this — renewals and payments are
              finally under control."
            </p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              — Early gym partner, Punjab
            </p>
          </div>
        </div>

        {/* Right: form (untouched logic) */}
        <div className="animate-scale-up lg:sticky lg:top-12">
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
              style={{ background: "var(--brand-teal)" }}
            />

            {success ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">✅</div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  Request Submitted!
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--text-muted)" }}
                >
                  Hamari team aapko jald hi contact karegi aur aapka gym account
                  setup karegi.
                </p>
                <Link
                  to="/login"
                  className="btn-primary w-full justify-center block text-center"
                >
                  Login Page →
                </Link>
              </div>
            ) : (
              <>
                <h2
                  className="text-2xl mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    color: "var(--text-primary)",
                  }}
                >
                  Request a Demo
                </h2>
                <p
                  className="text-sm mb-7"
                  style={{ color: "var(--text-muted)" }}
                >
                  Fill in your details and we'll set up your gym account
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { name: "gymName", label: "Gym Name", type: "text", placeholder: "Gym name", required: true },
    { name: "ownerName", label: "Your Name", type: "text", placeholder: "Your name", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "Email address", required: true },
    { name: "phone", label: "Phone (optional)", type: "tel", placeholder: "Phone number", required: false,
                      maxLength: 10,
                    },
                  ].map((f) => (
                    <div key={f.name}>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        required={f.required}
                        placeholder={f.placeholder}
                        maxLength={f.maxLength}
                        className="input-premium"
                      />
                    </div>
                  ))}

                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Message (optional)
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Message"
                      rows={3}
                      className="input-premium resize-none"
                    />
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
                    {loading ? "Submitting..." : "Request Demo →"}
                  </button>
                </form>

                <div className="glow-divider my-6" />

                <p
                  className="text-sm text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold hover:text-[#2DD4C4] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
        <h3
          className="text-xl mb-6 text-center"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            color: "var(--text-primary)",
          }}
        >
          Common Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-xl p-5 border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <p
                className="font-semibold text-sm mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {f.q}
              </p>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
