import { Link } from "react-router-dom";
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

export default function Landing() {
  return (
    <div className="bg-[#0E1011] text-white overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 animate-slide-top"
        style={{
          background: "rgba(14,16,17,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#why" className="hover:text-white transition-colors">Why us</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>
              Log in
            </Link>
            <Link to="/signup" className="btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.875rem" }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-14 items-center relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5A36]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <p className="label-tag mb-4 animate-fade-up">Built for Indian Gym Owners</p>
          <h1 className="display-xl mb-6 animate-fade-up delay-100" style={{ fontFamily: "var(--font-display)" }}>
            Run your gym.
            <br />
            <span className="text-shimmer">Not spreadsheets.</span>
          </h1>
          <p className="body-lg mb-8 max-w-md animate-fade-up delay-200">
            Members, billing, penalties, reminders, and reports — one system that replaces the register and the guesswork.
          </p>
          <div className="flex gap-4 animate-fade-up delay-300">
            <Link to="/signup" className="btn-primary animate-pulse-glow">Start Free →</Link>
            <a href="#features" className="btn-outline">See Features</a>
          </div>
        </div>

        {/* Mock dashboard */}
        <Animate variant="fadeRight" delay={200}>
          <div
            className="rounded-2xl p-5 animate-float"
            style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-4" style={{ background: "#1D2123" }}>
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>430</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Active Members</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: "#1D2123" }}>
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#2DD4C4" }}>₹1.2L</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Revenue (30d)</p>
              </div>
            </div>
            <div className="rounded-xl p-4 h-32 flex items-end gap-1.5" style={{ background: "#1D2123" }}>
              {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, #FF5A36, #ff8c42)`,
                    opacity: 0.4 + i * 0.08,
                    animation: `bar-grow 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms both`,
                    transformOrigin: "bottom",
                  }}
                />
              ))}
            </div>
          </div>
        </Animate>
      </section>

      {/* Pulse divider */}
      <div className="max-w-6xl mx-auto px-6">
        <svg viewBox="0 0 1200 60" className="w-full h-10" preserveAspectRatio="none">
          <polyline
            points="0,30 250,30 280,10 310,50 340,30 900,30 930,15 960,45 990,30 1200,30"
            fill="none" stroke="#2DD4C4" strokeWidth="1.5" opacity="0.35"
          />
        </svg>
      </div>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <Animate variant="fadeUp">
          <p className="label-tag mb-3">What's inside</p>
          <h2 className="display-md mb-3" style={{ fontFamily: "var(--font-display)" }}>Everything your gym needs</h2>
          <p className="body-md mb-12">One system, six jobs done properly.</p>
        </Animate>
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

      {/* Why us */}
      <section id="why" className="bg-[#16191B] border-y border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          <Animate variant="fadeLeft">
            <h2 className="display-md mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Stop losing money to
              <br />
              <span style={{ color: "var(--brand-orange)" }}>missed renewals.</span>
            </h2>
            <p className="body-lg mb-8">
              Most gyms lose 15–20% of revenue to members who quietly stop paying because no one followed up.
            </p>
            <ul className="space-y-4">
              {["No more paper registers or Excel", "Reminders sent automatically", "Know your revenue in real time"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "rgba(45,212,196,0.15)", color: "#2DD4C4" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Animate>
          <Animate variant="fadeRight">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-premium text-center py-8">
                <p className="stat-number" style={{ color: "#FF5A36" }}>20%</p>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Revenue lost to missed renewals</p>
              </div>
              <div className="card-premium text-center py-8">
                <p className="stat-number" style={{ color: "#2DD4C4" }}>2 min</p>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>To set up your gym account</p>
              </div>
            </div>
          </Animate>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <Animate variant="fadeUp">
          <h2 className="display-md mb-14" style={{ fontFamily: "var(--font-display)" }}>How it works</h2>
        </Animate>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <Animate key={s.n} variant="fadeUp" delay={i * 150}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", lineHeight: 1, color: "transparent", WebkitTextStroke: "2px #FF5A36", opacity: 0.7 }}>
                  {s.n}
                </p>
                <h3 className="text-lg mt-4 mb-2" style={{ fontWeight: 700 }}>{s.title}</h3>
                <p className="body-md text-sm">{s.desc}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Animate variant="scaleUp">
          <div className="bg-gradient-brand rounded-3xl px-10 py-16 text-center relative overflow-hidden animate-gradient">
            <div className="absolute inset-0 bg-noise pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="display-md mb-4" style={{ fontFamily: "var(--font-display)" }}>Your gym, running itself.</h2>
              <p className="mb-8 text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>Free to start. No card required.</p>
              <Link to="/signup" className="inline-block bg-white font-bold px-10 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:scale-105"
                style={{ color: "#0E1011", fontFamily: "var(--font-body)", fontSize: "1rem" }}>
                Create Free Account →
              </Link>
            </div>
          </div>
        </Animate>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.6)" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
          <p>© 2026 FlexOps. Built for gyms in India.</p>
        </div>
      </footer>
    </div>
  );
}
