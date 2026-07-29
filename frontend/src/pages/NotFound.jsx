import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const links = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-body)" }}
    >
      <SEO
        title="404 — Page Not Found"
        description="The page you're looking for doesn't exist. Go back to FlexOps home."
        noindex={true}
      />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5A36]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "6rem",
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "2px #FF5A36",
            opacity: 0.7,
          }}
        >
          404
        </p>

        <h1
          className="text-2xl mb-3 mt-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#ffffff" }}
        >
          Page not found
        </h1>

        <p className="mb-8 text-sm" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <nav aria-label="Recovery navigation" className="flex flex-wrap gap-3 justify-center mb-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="btn-primary">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
