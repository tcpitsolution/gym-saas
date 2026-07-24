import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Animate from "../components/Animate";

const features = [
  { icon: "👥", title: "Member Management", desc: "Add, search, and track every member — plans, renewals, expiry dates, all in one place." },
  { icon: "💳", title: "Billing & Penalty", desc: "Auto-calculate dues, track payments, and apply late fees without spreadsheets." },
  { icon: "✅", title: "Attendance Tracking", desc: "Simple check-ins, daily logs, and visit history for every member." },
  { icon: "📩", title: "Reminders & Messages", desc: "Send renewal reminders and offers directly to members — no manual follow-up." },
  { icon: "📊", title: "Reports & Analytics", desc: "Revenue trends, active vs expiring members — see your gym's health at a glance." },
  { icon: "🔐", title: "Live OTP Verification", desc: "Secure sign-ups with real-time verification, built right in." },
];

const steps = [
  { n: "01", title: "Sign up your gym", desc: "Create your account in under two minutes — no setup fees." },
  { n: "02", title: "Add your members", desc: "Import or add members, assign plans, and start tracking instantly." },
  { n: "03", title: "Run on autopilot", desc: "Reminders, reports, and renewals happen automatically." },
];

export default function Features() {
  return (
    <div className="bg-[#0E1011] text-white overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />

      {/* ── Header ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-14 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2DD4C4]/6 rounded-full blur-3xl pointer-events-none" />
        <Animate variant="fadeUp">
          <p className="label-tag mb-4">Features</p>
          <h1 className="display-xl mb-5 max-w-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Everything a gym owner
            <br />
            <span className="text-shimmer">actually needs.</span>
          </h1>
          <p className="body-lg max-w-xl">
            Built specifically for Indian gym owners — no bloated features you'll never use.
          </p>
        </Animate>
      </section>

      {/* ── Feature Grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Animate key={f.title} variant="fadeUp" delay={i * 100}>
              <div className="card-premium h-full">
                <span className="text-3xl animate-float inline-block">{f.icon}</span>
                <h3 className="mt-4 mb-2 text-lg" style={{ fontWeight: 700 }}>{f.title}</h3>
                <p className="body-md text-sm">{f.desc}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* ── AI Section ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#2DD4C4]/6 rounded-full blur-3xl pointer-events-none" />
        <Animate variant="fadeUp">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl animate-float inline-block">🤖</span>
            <p className="label-tag" style={{ color: "#2DD4C4" }}>AI-Powered</p>
          </div>
          <h2 className="display-md mb-4 max-w-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Your gym gets smarter
            <br />
            <span className="text-shimmer">every single day.</span>
          </h2>
          <p className="body-lg max-w-xl mb-14">
            FlexOps comes with built-in AI tools that predict problems before they happen — so you never lose a member silently.
          </p>
        </Animate>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Animate variant="fadeLeft" delay={0}>
            <div
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #16191B 0%, rgba(45,212,196,0.06) 100%)",
                border: "1px solid rgba(45,212,196,0.2)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DD4C4]/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "rgba(45,212,196,0.12)", border: "1px solid rgba(45,212,196,0.2)" }}
                >
                  🔮
                </div>
                <div>
                  <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Churn Prediction</h3>
                  <p className="body-md text-sm">
                    AI automatically flags members who are likely to leave — based on attendance patterns and payment history — before their membership even expires.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }}>Auto-runs daily</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>No setup needed</span>
              </div>
            </div>
          </Animate>

          <Animate variant="fadeRight" delay={100}>
            <div
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #16191B 0%, rgba(255,90,54,0.06) 100%)",
                border: "1px solid rgba(255,90,54,0.2)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A36]/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "rgba(255,90,54,0.12)", border: "1px solid rgba(255,90,54,0.2)" }}
                >
                  📬
                </div>
                <div>
                  <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Smart Reminders</h3>
                  <p className="body-md text-sm">
                    AI decides the best time to send renewal reminders to each member — not a generic blast, but personalized nudges that actually get read.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(255,90,54,0.12)", color: "#FF5A36" }}>WhatsApp + SMS</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>Fully automated</span>
              </div>
            </div>
          </Animate>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "📈",
              title: "Revenue Forecasting",
              desc: "See next month's expected revenue based on current member trends — plan ahead with confidence.",
              color: "#2DD4C4",
            },
            {
              icon: "⚠️",
              title: "Penalty Auto-Detection",
              desc: "AI scans for overdue payments every night and applies penalties automatically — no manual checking.",
              color: "#FF5A36",
            },
            {
              icon: "💡",
              title: "Business Insights",
              desc: "Weekly AI-generated summaries of what's working, what's not, and what to fix in your gym.",
              color: "#2DD4C4",
            },
          ].map((item, i) => (
            <Animate key={item.title} variant="fadeUp" delay={i * 100}>
              <div className="card-premium h-full">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ background: `rgba(${item.color === "#2DD4C4" ? "45,212,196" : "255,90,54"},0.1)`, border: `1px solid rgba(${item.color === "#2DD4C4" ? "45,212,196" : "255,90,54"},0.2)` }}
                >
                  {item.icon}
                </div>
                <h3 className="text-base mb-2" style={{ fontWeight: 700 }}>{item.title}</h3>
                <p className="body-md text-sm">{item.desc}</p>
              </div>
            </Animate>
          ))}
        </div>

        {/* AI badge strip */}
        <Animate variant="fadeUp" delay={300}>
          <div
            className="mt-10 rounded-2xl px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: "rgba(45,212,196,0.05)", border: "1px solid rgba(45,212,196,0.15)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <p className="font-semibold text-white">All AI features are included — no extra charge, no configuration.</p>
            </div>
            <span
              className="shrink-0 text-sm font-bold px-4 py-2 rounded-xl"
              style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4", border: "1px solid rgba(45,212,196,0.2)" }}
            >
              Included in every plan
            </span>
          </div>
        </Animate>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#16191B] border-y border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Animate variant="fadeUp">
            <h2 className="display-md mb-14" style={{ fontFamily: "var(--font-display)" }}>
              How it works
            </h2>
          </Animate>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <Animate key={s.n} variant="fadeUp" delay={i * 150}>
                <div className="relative">
                  <p
                    className="mb-4"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "3.5rem",
                      lineHeight: 1,
                      color: "transparent",
                      WebkitTextStroke: "2px #FF5A36",
                      opacity: 0.7,
                    }}
                  >
                    {s.n}
                  </p>
                  <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>{s.title}</h3>
                  <p className="body-md text-sm">{s.desc}</p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Animate variant="scaleUp">
          <h2 className="display-md mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Ready to see it in action?
          </h2>
          <Link to="/signup" className="btn-primary animate-pulse-glow">
            Start Free →
          </Link>
        </Animate>
      </section>

      <Footer />
    </div>
  );
}
