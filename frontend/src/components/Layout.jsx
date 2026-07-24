import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#0A0C0D", fontFamily: "var(--font-body)" }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto page-enter" style={{ color: "#fff" }}>
        {children}
      </main>
    </div>
  );
}
