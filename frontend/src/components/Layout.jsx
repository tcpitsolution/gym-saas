import { useState } from "react";
import Sidebar from "./Sidebar";
import { useTheme } from "../context/ThemeContext";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, toggle } = useTheme();

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "var(--bg-base)",
        fontFamily: "var(--font-body)",
        transition: "background 0.3s ease",
      }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40"
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1.5 p-1"
            aria-label="Open menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-5 h-0.5 rounded-full"
                style={{ background: "var(--text-primary)" }}
              />
            ))}
          </button>

          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              color: "var(--text-primary)",
            }}
          >
            FLEX<span style={{ color: "var(--brand-orange)" }}>OPS</span>
          </span>

          <button
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{
              background: "var(--bg-card-2)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        <main
          className="flex-1 p-4 lg:p-8 overflow-auto page-enter"
          style={{ color: "var(--text-primary)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
