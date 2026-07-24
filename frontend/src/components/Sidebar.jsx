import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: "⚡" },
  { path: "/members/new", label: "Add Member", icon: "➕" },
  { path: "/members", label: "Members", icon: "👥" },
  { path: "/reports", label: "Reports", icon: "📊" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0 animate-fade-in"
      style={{
        background: "linear-gradient(180deg, #111416 0%, #0E1011 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link to="/">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.02em" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
        </Link>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Gym Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3">
        <p className="text-xs font-semibold px-3 mb-3" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Menu
        </p>
        {navItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200"
              style={{
                animationDelay: `${i * 60}ms`,
                background: active ? "rgba(255,90,54,0.12)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                borderLeft: active ? "2px solid var(--brand-orange)" : "2px solid transparent",
                boxShadow: active ? "0 0 20px rgba(255,90,54,0.08)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <div className="glow-divider mb-4" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b6b"; e.currentTarget.style.background = "rgba(255,107,107,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
        >
          <span>⎋</span> Log out
        </button>
      </div>
    </aside>
  );
}
