import { Link } from "react-router-dom";
import Animate from "./Animate";

export default function Footer() {
  return (
    <footer aria-label="Site footer" style={{ background: "#0A0C0D", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-body)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10 text-sm">
        <Animate variant="fadeUp">
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "#fff" }}>
              FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
            </span>
            <p className="mt-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              Built for gyms in India.
              <br />
              Simple. Powerful. Affordable.
            </p>
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={100}>
          <div>
            <p className="font-semibold mb-4" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", fontSize: "0.7rem", textTransform: "uppercase" }}>
              Product
            </p>
            <ul className="space-y-2.5">
              {[{ to: "/features", label: "Features" }, { to: "/pricing", label: "Pricing" }].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors duration-200" style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={200}>
          <div>
            <p className="font-semibold mb-4" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", fontSize: "0.7rem", textTransform: "uppercase" }}>
              Company
            </p>
            <ul className="space-y-2.5">
              {[{ to: "/contact", label: "Contact Us" }, { to: "/signup", label: "Get Started" }].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors duration-200" style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={300}>
          <div>
            <p className="font-semibold mb-4" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", fontSize: "0.7rem", textTransform: "uppercase" }}>
              Contact
            </p>
            <ul className="space-y-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              <li>soutiontcp@gmail.com</li>
              <li>Ludhiana, Punjab, India</li>
            </ul>
          </div>
        </Animate>
      </div>

      <div className="glow-divider" />

      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
        <p>© 2026 FlexOps. All rights reserved.</p>
        <p>
          Powered by{" "}
          <a
            href="https://tcpitsolution.click"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand-teal)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            TCP IT Solution
          </a>
        </p>
      </div>
    </footer>
  );
}
