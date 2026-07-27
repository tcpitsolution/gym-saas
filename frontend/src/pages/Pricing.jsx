import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Animate from "../components/Animate";
import pricingScreen from "../assets/4th.png";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For gyms just getting started",
    features: ["Up to 100 members", "Attendance tracking", "Basic reports"],
  },
  {
    name: "Growth",
    price: "₹999",
    period: "/mo",
    desc: "For growing gyms",
    features: ["Unlimited members", "Reminders & messaging", "Penalty tracking", "CSV exports"],
    highlight: true,
  },
  {
    name: "Pro",
    price: "₹2,499",
    period: "/mo",
    desc: "For multi-branch gyms",
    features: ["Everything in Growth", "Multiple branches", "Staff roles & permissions", "Priority support"],
  },
];

const faqs = [
  { q: "Is there really a free plan?", a: "Yes, up to 100 members with core features, no card required." },
  { q: "Can I switch plans later?", a: "Yes, upgrade or downgrade anytime from your dashboard." },
  { q: "Do you charge setup fees?", a: "No setup fees on any plan, ever." },
];

export default function Pricing() {
  return (
    <div className="landing-page overflow-x-hidden">
      <Navbar />

      {/* ── Header ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-14 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#FF5A36]/8 rounded-full blur-3xl pointer-events-none" />
        <Animate variant="fadeUp">
          <p className="label-tag mb-4">Pricing</p>
          <h1 className="display-xl mb-5" style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}>
            Simple pricing.
            <br />
            <span className="text-shimmer">No surprises.</span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>Start free. Upgrade only when you're ready.</p>
        </Animate>
      </section>

      {/* ── Plans ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((p, i) => (
            <Animate key={p.name} variant="fadeUp" delay={i * 120}>
              <div
                className={`rounded-2xl p-8 border relative transition-all duration-300 ${
                  p.highlight
                    ? "bg-[#16191B] border-[#FF5A36] shadow-[0_0_40px_rgba(255,90,54,0.18)] scale-105"
                    : "bg-[#16191B] border-white/8 hover:border-white/20 hover:-translate-y-1"
                }`}
              >
                {p.highlight && (
                  <span className="badge-popular absolute -top-3.5 left-1/2 -translate-x-1/2">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg mb-1" style={{ fontWeight: 700, color: "#ffffff" }}>{p.name}</h3>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>{p.desc}</p>
                <div className="flex items-end gap-1 mb-7">
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", lineHeight: 1, color: "#ffffff" }}>
                    {p.price}
                  </span>
                  {p.period && <span className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{p.period}</span>}
                </div>
                <ul className="space-y-3 text-sm mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#2DD4C4]/15 flex items-center justify-center text-[#2DD4C4] text-[10px] font-bold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all duration-300 ${
                    p.highlight
                      ? "btn-primary w-full justify-center"
                      : ""
                  }`}
                  style={!p.highlight ? { border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" } : {}}
                >
                  Get Started
                </Link>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Animate variant="fadeUp">
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{
              border: "1px solid rgba(255,90,54,0.2)",
              boxShadow: "0 0 60px rgba(255,90,54,0.1), 0 24px 48px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={pricingScreen}
              alt="FlexOps app screen"
              className="w-full h-auto block"
              style={{ maxHeight: "480px", objectFit: "cover", objectPosition: "top" }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0E1011] to-transparent" />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span
                className="text-sm px-4 py-2 rounded-full font-semibold"
                style={{ background: "rgba(255,90,54,0.15)", color: "#FF5A36", border: "1px solid rgba(255,90,54,0.3)" }}
              >
                Included in every plan
              </span>
            </div>
          </div>
        </Animate>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#16191B] border-y border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Animate variant="fadeUp">
            <h2 className="display-md mb-12" style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}>
              Frequently asked
            </h2>
          </Animate>
          <div className="grid md:grid-cols-3 gap-8">
            {faqs.map((f, i) => (
              <Animate key={f.q} variant="fadeUp" delay={i * 120}>
                <div className="card-premium">
                  <h3 className="font-semibold mb-3" style={{ color: "#ffffff" }}>{f.q}</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{f.a}</p>
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Animate variant="scaleUp">
          <h2 className="display-md mb-6" style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}>
            Start free today
          </h2>
          <Link to="/signup" className="btn-primary animate-pulse-glow">
            Create Free Account →
          </Link>
        </Animate>
      </section>

      <Footer />
    </div>
  );
}
