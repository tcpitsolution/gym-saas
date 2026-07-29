import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Animate from "../components/Animate";
import SEO from "../components/SEO";
import contactScreen from "../assets/5th.png";

const info = [
  { icon: "📍", title: "Location", value: "Ludhiana, Punjab, India" },
  { icon: "📧", title: "Email", value: "soutiontcp@gmail.com" },
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
    <div className="landing-page overflow-x-hidden">
      <SEO
        title="Contact Us — Get in Touch with FlexOps"
        description="Have questions about FlexOps gym management software? Contact our team in Ludhiana, Punjab. We reply within a few hours on weekdays."
        canonical="/contact"
        keywords="contact FlexOps, gym software support, FlexOps help, gym management contact India"
      />
      <Navbar />

      {/* ── Header ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-14 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-[#2DD4C4]/6 rounded-full blur-3xl pointer-events-none" />
        <Animate variant="fadeUp">
          <p className="label-tag mb-4">Contact Us</p>
          <h1
            className="display-xl"
            style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}
          >
            Let's talk about
            <br />
            <span className="text-shimmer">your gym.</span>
          </h1>
        </Animate>
      </section>

      {/* ── Form + Info ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-10">
        <Animate variant="fadeLeft">
          <form
            onSubmit={handleSubmit}
            className="bg-[#16191B] border border-white/8 rounded-2xl p-8 space-y-5"
          >
            {[
              {
                label: "Name",
                key: "name",
                type: "text",
                placeholder: "Your name",
              },
              {
                label: "Email",
                key: "email",
                type: "email",
                placeholder: "you@example.com",
              },
            ].map((field) => (
              <div key={field.key}>
                <label
                  className="block text-sm mb-1.5 font-medium"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  className="input-premium"
                />
              </div>
            ))}
            <div>
              <label
                className="block text-sm mb-1.5 font-medium"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Message
              </label>
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
                <span className="text-2xl animate-float inline-block">
                  {item.icon}
                </span>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "#ffffff" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            </Animate>
          ))}
          <Animate variant="fadeRight" delay={360}>
            <div className="card-premium bg-gradient-to-br from-[#FF5A36]/10 to-transparent border-[#FF5A36]/20">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Have questions before signing up? We usually reply within a few
                hours.
              </p>
            </div>
          </Animate>
        </div>
      </section>

      {/* ── App Screenshot ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Animate variant="fadeUp">
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{
              border: "1px solid rgba(45,212,196,0.2)",
              boxShadow:
                "0 0 60px rgba(45,212,196,0.08), 0 24px 48px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={contactScreen}
              alt="FlexOps app screen"
              className="w-full h-auto block"
              style={{
                maxHeight: "420px",
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0E1011] to-transparent" />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span
                className="text-sm px-4 py-2 rounded-full font-semibold"
                style={{
                  background: "rgba(45,212,196,0.12)",
                  color: "#2DD4C4",
                  border: "1px solid rgba(45,212,196,0.25)",
                }}
              >
                See it live — free to try
              </span>
            </div>
          </div>
        </Animate>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Animate variant="scaleUp">
          <h2
            className="display-md mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}
          >
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
