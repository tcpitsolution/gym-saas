import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/admin/dashboard",      label: "Dashboard",        icon: "⚡" },
  { path: "/admin/gyms",           label: "Gym Owners",       icon: "🏋️" },
  { path: "/admin/access-control", label: "Access Control",   icon: "🔐" },
  { path: "/admin/create-gym",     label: "Add Gym Partner",  icon: "➕" },
  { path: "/admin/demo-requests",  label: "Demo Requests",    icon: "📋" },
  { path: "/admin/reports",        label: "Reports",          icon: "📊" },
  { path: "/admin/plans",          label: "Plans",            icon: "📦" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "#fff" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Super Admin</p>
        </div>
        {/* Close button — mobile only */}
        <button
          className="lg:hidden p-1 rounded-lg"
          onClick={() => setSidebarOpen(false)}
          style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none" }}
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 py-5 px-3 overflow-y-auto">
        <p className="text-xs font-semibold px-3 mb-3" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Admin Menu
        </p>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200"
              style={{
                background: active ? "rgba(255,90,54,0.12)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                borderLeft: active ? "2px solid var(--brand-orange)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <div className="glow-divider mb-4" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b6b"; e.currentTarget.style.background = "rgba(255,107,107,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
        >
          <span>⎋</span> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#0E1011", fontFamily: "var(--font-body)" }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen shrink-0"
        style={{ background: "linear-gradient(180deg, #111416 0%, #0E1011 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative z-10 w-64 min-h-screen flex flex-col animate-fade-left"
            style={{ background: "linear-gradient(180deg, #111416 0%, #0E1011 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-4 border-b"
          style={{ background: "#111416", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", color: "#fff", fontSize: "1.25rem", cursor: "pointer" }}
          >
            ☰
          </button>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#fff" }}>
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Admin</span>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
