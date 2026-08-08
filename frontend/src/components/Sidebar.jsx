import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

// Feature key mapped to nav path
const FEATURE_MAP = {
  "/members": "members",
  "/members/new": "members",
  "/attendance": "members",
  "/payments": "payments",
  "/trainers": "trainers",
  "/reports": "reports",
  "/ask-ai": "askai",
};

const navGroups = [
  {
    label: "Main",
    items: [{ path: "/dashboard", label: "Overview", icon: "⚡" }],
  },
  {
    label: "Members",
    items: [
      { path: "/members", label: "Members", icon: "👥" },
      { path: "/members/new", label: "Add Member", icon: "➕" },
      { path: "/attendance", label: "Attendance", icon: "✅" },
    ],
  },
  {
    label: "Business",
    items: [
      { path: "/plans", label: "Plans", icon: "📦" },
      { path: "/payments", label: "Payments", icon: "💳" },
    ],
  },
  {
    label: "Staff",
    items: [{ path: "/trainers", label: "Trainers", icon: "🏋️" }],
  },
  {
    label: "Insights",
    items: [
      { path: "/reports", label: "Reports", icon: "📊" },
      { path: "/ask-ai", label: "Ask AI", icon: "🤖" },
    ],
  },
];

// APK download link — file name on GitHub release must always stay "flexopsapp.apk"
// so this "latest" link always serves the newest uploaded build automatically.
const APK_URL =
  "https://github.com/tcpitsolution/gym-saas/releases/latest/download/flexopsapp.apk";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { logout, gymName, features } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [lockedTooltip, setLockedTooltip] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLocked = (path) => {
    const key = FEATURE_MAP[path];
    if (!key) return false;
    return features[key] === false;
  };

  const sidebarContent = (
    <aside
      className="w-56 min-h-screen flex flex-col shrink-0"
      style={{
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border-subtle)",
        fontFamily: "var(--font-body)",
        transition: "background 0.3s ease",
      }}
    >
      <div
        className="px-5 py-5 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link to="/" onClick={onClose}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              color: "var(--text-primary)",
            }}
          >
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>
        </Link>
        {/* Close button — mobile only */}
        <button
          className="lg:hidden p-1 rounded-lg"
          onClick={onClose}
          style={{ color: "var(--text-faint)" }}
        >
          ✕
        </button>
      </div>

      {gymName && (
        <p
          className="px-5 pt-2 text-xs truncate"
          style={{ color: "var(--text-faint)" }}
        >
          {gymName}
        </p>
      )}

      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p
              className="px-5 text-[10px] font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--text-faint)" }}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = location.pathname === item.path;
              const locked = isLocked(item.path);
              return locked ? (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl mb-0.5 text-sm font-medium cursor-not-allowed relative"
                  style={{
                    background: "transparent",
                    color: "rgba(255,255,255,0.2)",
                    borderLeft: "2px solid transparent",
                  }}
                  title="Contact admin to unlock this feature"
                >
                  <span className="text-base opacity-40">{item.icon}</span>
                  {item.label}
                  <span
                    className="ml-auto text-xs"
                    style={{ color: "rgba(255,90,54,0.6)" }}
                  >
                    🔒
                  </span>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150"
                  style={{
                    background: active ? "rgba(255,90,54,0.12)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    borderLeft: active
                      ? "2px solid var(--brand-orange)"
                      : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <div className="glow-divider mb-3" />

        {/* Download App — direct APK download, always serves latest GitHub release */}
        <a
          href={APK_URL}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm font-medium transition-all duration-150 mb-1"
          style={{ color: "var(--text-faint)", background: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card-2)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-faint)";
          }}
        >
          <span>📲</span>
          Download App
        </a>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm font-medium transition-all duration-150 mb-1"
          style={{ color: "var(--text-faint)", background: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card-2)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-faint)";
          }}
        >
          <span>{dark ? "☀️" : "🌙"}</span>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm font-medium transition-all duration-150"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ff6b6b";
            e.currentTarget.style.background = "rgba(255,107,107,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-faint)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span>⎋</span> Log out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebarContent}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative z-10 animate-fade-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
