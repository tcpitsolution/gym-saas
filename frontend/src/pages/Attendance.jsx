import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";
import { useToast } from "../context/ToastContext";

export default function Attendance() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [method, setMethod] = useState("Manual");
  const toast = useToast();
  const [stats, setStats] = useState({ todayCheckIns: 0, activeNow: 0, blocked: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, tRes, sRes] = await Promise.all([
        api.get("/members"),
        api.get("/attendance/today"),
        api.get("/attendance/stats"),
      ]);
      setMembers(mRes.data || []);
      setTodayLogs(tRes.data || []);
      setStats(sRes.data || { todayCheckIns: 0, activeNow: 0, blocked: 0 });
    } catch (err) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered([]); return; }
    const q = search.toLowerCase();
    setFiltered(members.filter((m) => m.name?.toLowerCase().includes(q) || m.phone?.toLowerCase().includes(q)));
  }, [search, members]);

  const showMsg = (text, type = "success") => {
    if (type === "error") toast.error(text);
    else toast.success(text);
  };

  const refreshTodayLogs = async () => {
    const tRes = await api.get("/attendance/today");
    setTodayLogs(tRes.data || []);
  };

  const handleCheckin = async (memberId) => {
    const member = members.find((m) => m._id === memberId);
    if (!member) { showMsg("Member not found", "error"); return; }
    if (member.status && member.status !== "active") { showMsg("Member is not active", "error"); return; }
    setCheckingIn(memberId);
    try {
      await api.post("/attendance/checkin", { memberId, method });
      await refreshTodayLogs();
      await fetchData();
      setSearch("");
      setFiltered([]);
      showMsg("Check-in successful ✓");
    } catch (err) {
      showMsg(err.response?.data?.error || "Check-in failed", "error");
    } finally {
      setCheckingIn(null);
    }
  };

  const fmt = (date) =>
    date ? new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

  const currentInside = todayLogs.length;

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="mb-8">
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--text-primary)" }}>
            Attendance
          </h1>
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </Animate>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today Check-ins", value: stats.todayCheckIns },
          { label: "Active Now", value: currentInside || stats.activeNow },
          { label: "Blocked", value: stats.blocked || 0 },
          { label: "Today's Logs", value: todayLogs.length },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{item.label}</p>
            <h3 className="text-2xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Animate variant="fadeUp" delay={100}>
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "var(--brand-orange)" }} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Mark Attendance
              </h2>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: "var(--bg-card-2)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
                <option value="Manual">Manual</option>
                <option value="QR">QR</option>
                <option value="PIN">PIN</option>
                <option value="App">App</option>
              </select>
            </div>

            <input type="text" placeholder="Search member by name or phone..."
              value={search} onChange={(e) => setSearch(e.target.value)} className="input-premium mb-3" />

            {filtered.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                {filtered.slice(0, 6).map((m) => {
                  const alreadyIn = todayLogs.some((l) => l.memberId?._id === m._id && !l.checkOutAt);
                  const isActive = !m.status || m.status === "active";
                  return (
                    <div key={m._id} className="flex items-center justify-between px-4 py-3 transition-colors"
                      style={{ borderBottom: "1px solid var(--border-subtle)", opacity: isActive ? 1 : 0.55 }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                          {m.phone}{" "}{m.membershipEnd ? `• Ends: ${new Date(m.membershipEnd).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <button onClick={() => handleCheckin(m._id)}
                        disabled={checkingIn === m._id || alreadyIn || !isActive}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                        style={{
                          background: alreadyIn ? "var(--bg-card-2)" : !isActive ? "rgba(255,107,107,0.12)" : "rgba(45,212,196,0.15)",
                          color: alreadyIn ? "var(--text-faint)" : !isActive ? "#ff6b6b" : "#2DD4C4",
                          cursor: alreadyIn || !isActive ? "not-allowed" : "pointer",
                        }}>
                        {checkingIn === m._id ? "..." : !isActive ? "Inactive" : alreadyIn ? "Checked In" : "Check In"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {search && filtered.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-faint)" }}>No member found</p>
            )}
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={200}>
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-0.5 w-10 rounded-full mb-5" style={{ background: "#2DD4C4" }} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Today's Log
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: "rgba(255,90,54,0.12)", color: "#FF5A36" }}>
                {todayLogs.length} visits
              </span>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-faint)" }}>
                <div className="w-4 h-4 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : todayLogs.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-faint)" }}>No check-ins today yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {todayLogs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "var(--bg-card-2)", border: "1px solid var(--border-subtle)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{log.memberId?.name || "—"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                        In: {fmt(log.checkInAt)}{log.method ? ` · ${log.method}` : ""}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }}>
                      ✓ Checked In
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Animate>
      </div>
    </Layout>
  );
}
