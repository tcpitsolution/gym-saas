import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Animate from "../components/Animate";

const info = [
  { icon: "📍", title: "Location", value: "Ludhiana, Punjab, India" },
  { icon: "📧", title: "Email", value: "hello@flexops.in" },
  { icon: "⏰", title: "Support Hours", value: "Mon–Sat, 9am – 7pm IST" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-[#0E1011] text-white overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />

      {/* ── Header ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-14 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-[#2DD4C4]/6 rounded-full blur-3xl pointer-events-none" />
        <Animate variant="fadeUp">
          <p className="label-tag mb-4">Contact Us</p>
          <h1 className="display-xl" style={{ fontFamily: "var(--font-display)" }}>
            Let's talk about
            <br />
            <span className="text-shimmer">your gym.</span>
          </h1>
        </Animate>
      </section>

      {/* ── Form + Info ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-10">
        <Animate variant="fadeLeft">
          <form
            onSubmit={handleSubmit}
            className="bg-[#16191B] border border-white/8 rounded-2xl p-8 space-y-5"
          >
            {[
              { label: "Name", key: "name", type: "text", placeholder: "Your name" },
              { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-white/55 mb-1.5 font-medium">{field.label}</label>
                <input
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="input-premium"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm text-white/55 mb-1.5 font-medium">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Tell us about your gym..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-premium resize-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={sent}
            >
              {sent ? "✓ Sent! We'll be in touch." : "Send Message →"}
            </button>
          </form>
        </Animate>

        <div className="space-y-5">
          {info.map((item, i) => (
            <Animate key={item.title} variant="fadeRight" delay={i * 120}>
              <div className="card-premium flex items-start gap-4">
                <span className="text-2xl animate-float inline-block">{item.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="body-md text-sm">{item.value}</p>
                </div>
              </div>
            </Animate>
          ))}
          <Animate variant="fadeRight" delay={360}>
            <div className="card-premium bg-gradient-to-br from-[#FF5A36]/10 to-transparent border-[#FF5A36]/20">
              <p className="text-white/70 text-sm leading-relaxed">
                Have questions before signing up? We usually reply within a few hours.
              </p>
            </div>
          </Animate>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Animate variant="scaleUp">
          <h2 className="display-md mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Or just try it yourself
          </h2>
          <a href="/signup" className="btn-primary animate-pulse-glow">
            Start Free →
          </a>
        </Animate>
      </section>

      <Footer />
    </div>
  );
}
