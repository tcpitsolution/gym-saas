import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300 animate-slide-top"
      style={{
        background: scrolled ? "rgba(14,16,17,0.96)" : "rgba(14,16,17,0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.02em" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium transition-colors duration-200 relative"
                style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                {l.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: "var(--brand-orange)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.55)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
          >
            Log in
          </Link>
          <Link to="/signup" className="btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.875rem" }}>
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                background: "#fff",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(4px, 4px)"
                  : i === 1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(4px, -4px)"
                  : "none",
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-5 space-y-3 animate-fade-up"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block py-2 text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="btn-outline text-sm" style={{ padding: "0.55rem 1.25rem" }}>Log in</Link>
            <Link to="/signup" className="btn-primary text-sm" style={{ padding: "0.55rem 1.25rem" }}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
