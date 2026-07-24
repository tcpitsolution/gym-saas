import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Animate from "../components/Animate";

const featurePreview = [
  { icon: "👥", title: "Member Management", desc: "Track every member, plan, and renewal in one place." },
  { icon: "💳", title: "Billing & Penalty", desc: "Auto-calculate dues and late fees, no spreadsheets." },
  { icon: "📊", title: "Reports & Analytics", desc: "See revenue and member health at a glance." },
];

const stats = [
  { value: "20%", label: "Revenue lost to missed renewals", color: "text-[#FF5A36]" },
  { value: "2 min", label: "To set up your gym account", color: "text-[#2DD4C4]" },
  { value: "500+", label: "Gyms already on FlexOps", color: "text-white" },
  { value: "₹0", label: "Setup fee, ever", color: "text-[#2DD4C4]" },
];

export default function Home() {
  return (
    <div className="bg-[#0E1011] text-white overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative min-h-[88vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(14,16,17,0.97), rgba(14,16,17,0.6)), url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80')",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#2DD4C4]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
          <div className="max-w-xl">
            <p className="label-tag animate-fade-up">Built for Indian Gym Owners</p>
            <h1
              className="display-xl mt-4 mb-6 animate-fade-up delay-100"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Run your gym.
              <br />
              <span className="text-shimmer">Not spreadsheets.</span>
            </h1>
            <p className="body-lg mb-8 animate-fade-up delay-200">
              Members, billing, penalties, reminders, and reports — one system
              that replaces the register and the guesswork.
            </p>
            <div className="flex gap-4 animate-fade-up delay-300">
              <Link to="/signup" className="btn-primary animate-pulse-glow">
                Start Free →
              </Link>
              <Link to="/features" className="btn-outline">
                See Features
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0E1011] to-transparent" />
      </section>

      {/* ── Feature Preview ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Animate variant="fadeUp">
          <p className="label-tag mb-3">What's inside</p>
          <h2 className="display-md mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Everything your gym needs
          </h2>
          <p className="body-md mb-12 max-w-lg">
            A quick look — full details on the Features page.
          </p>
        </Animate>
        <div className="grid md:grid-cols-3 gap-6">
          {featurePreview.map((f, i) => (
            <Animate key={f.title} variant="fadeUp" delay={i * 120}>
              <div className="card-premium h-full">
                <span className="text-3xl animate-float inline-block">{f.icon}</span>
                <h3 className="font-semibold text-lg mt-4 mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 700 }}>
                  {f.title}
                </h3>
                <p className="body-md text-sm">{f.desc}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-white/8 bg-[#16191B] relative overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Animate key={s.label} variant="scaleUp" delay={i * 100}>
              <div className="text-center">
                <p className={`stat-number ${s.color} delay-${i * 100}`}>{s.value}</p>
                <p className="text-xs text-white/45 mt-2 leading-relaxed">{s.label}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <Animate variant="fadeLeft">
          <h2 className="display-md mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Stop losing money to
            <br />
            <span className="text-[#FF5A36]">missed renewals.</span>
          </h2>
          <p className="body-lg mb-8">
            Most gyms lose 15–20% of revenue to members who quietly stop
            paying because no one followed up. Automated reminders fix that —
            quietly, in the background.
          </p>
          <ul className="space-y-4">
            {["No more paper registers or Excel", "Reminders sent automatically", "Know your revenue in real time"].map((item, i) => (
              <li key={item} className="flex items-center gap-3 text-white/75 font-medium animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="w-5 h-5 rounded-full bg-[#2DD4C4]/15 flex items-center justify-center text-[#2DD4C4] text-xs font-bold shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Animate>
        <Animate variant="fadeRight">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-premium text-center py-8">
              <p className="stat-number text-[#FF5A36]">20%</p>
              <p className="text-xs text-white/45 mt-2">Revenue lost to missed renewals</p>
            </div>
            <div className="card-premium text-center py-8">
              <p className="stat-number text-[#2DD4C4]">2 min</p>
              <p className="text-xs text-white/45 mt-2">To set up your gym account</p>
            </div>
            <div className="card-premium col-span-2 text-center py-6">
              <p className="stat-number text-white">₹0</p>
              <p className="text-xs text-white/45 mt-2">Setup fee, ever</p>
            </div>
          </div>
        </Animate>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Animate variant="scaleUp">
          <div className="bg-gradient-brand rounded-3xl px-10 py-16 text-center relative overflow-hidden animate-gradient">
            <div className="absolute inset-0 bg-noise pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="display-md mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Your gym, running itself.
              </h2>
              <p className="text-white/85 mb-8 text-lg">Free to start. No card required.</p>
              <Link
                to="/signup"
                className="inline-block bg-white text-[#0E1011] font-bold px-10 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:scale-105 hover:shadow-2xl"
                style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}
              >
                Create Free Account →
              </Link>
            </div>
          </div>
        </Animate>
      </section>

      <Footer />
    </div>
  );
}
