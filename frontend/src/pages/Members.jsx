import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Animate from "../components/Animate";
import MemberDrawer from "../components/MemberDrawer";

const statusTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expired", label: "Expired" },
  { key: "paused", label: "Paused" },
];

function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  const end = new Date(dateStr);
  const now = new Date();
  const diffDays = (end - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members", {
        params: { search, status: statusFilter },
      });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); fetchMembers(); };

  const handleCheckIn = async (memberId) => {
    setActionLoadingId(memberId);
    try {
      await api.post("/attendance/checkin", { memberId });
      alert("Checked in!");
    } catch (err) {
      alert(err.response?.data?.error || "Check-in failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeCount = members.filter((m) => m.status === "active").length;
  const expiringSoonCount = members.filter((m) => isExpiringSoon(m.membershipEnd)).length;
  const expiredCount = members.filter((m) => m.status === "expired").length;

  return (
    <>
      <Layout>
        <Animate variant="fadeUp">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--text-primary)" }}>
                Members
              </h1>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Manage all your gym members
              </p>
            </div>
            <Link to="/members/new" className="btn-primary">+ Add Member</Link>
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={50}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Members", value: members.length },
              { label: "Active", value: activeCount, color: "#2DD4C4" },
              { label: "Expiring Soon (7d)", value: expiringSoonCount, color: "#FF5A36" },
              { label: "Expired", value: expiredCount },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-2xl font-bold" style={{ color: c.color || "var(--text-primary)" }}>{c.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{c.label}</p>
              </div>
            ))}
          </div>
        </Animate>

        <Animate variant="fadeUp" delay={100}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-card)" }}>
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition"
                  style={statusFilter === tab.key ? { background: "#FF5A36", color: "#fff" } : { color: "var(--text-muted)" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="flex gap-3">
              <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-premium max-w-sm" />
              <button type="submit" className="btn-outline px-5 py-2.5 text-sm">Search</button>
            </form>
          </div>
        </Animate>

        {loading ? (
          <div className="flex items-center gap-3 animate-fade-in" style={{ color: "var(--text-faint)" }}>
            <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : members.length === 0 ? (
          <Animate variant="fadeUp">
            <div className="text-center py-20" style={{ color: "var(--text-faint)" }}>
              <p className="text-5xl mb-4">👥</p>
              <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>No members found.</p>
              <p className="text-sm mt-1">Try a different filter or add a new member.</p>
            </div>
          </Animate>
        ) : (
          <Animate variant="fadeUp" delay={200}>
            <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card-2)" }}>
                    {["Name", "Phone", "Status", "Plan", "Ends", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 font-semibold whitespace-nowrap"
                        style={{ color: "var(--text-faint)", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const expiringSoon = isExpiringSoon(m.membershipEnd);
                    return (
                      <tr key={m._id} onClick={() => setSelectedMember(m)}
                        className="transition-colors duration-150 cursor-pointer"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{m.name}</td>
                        <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{m.phone}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={m.status === "active"
                                ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }
                                : { background: "var(--bg-card-2)", color: "var(--text-muted)" }}>
                              {m.status}
                            </span>
                            {expiringSoon && (
                              <span className="px-2 py-1 rounded-full text-[10px] font-semibold"
                                style={{ background: "rgba(255,90,54,0.12)", color: "#FF5A36" }}>
                                Expiring
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{m.currentPlan?.name || "—"}</td>
                        <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>
                          {m.membershipEnd ? new Date(m.membershipEnd).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => handleCheckIn(m._id)} disabled={actionLoadingId === m._id}
                              className="px-2.5 py-1 rounded-md text-xs font-medium transition disabled:opacity-40"
                              style={{ background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }}>
                              {actionLoadingId === m._id ? "..." : "Check In"}
                            </button>
                            <Link to={`/members/${m._id}/renew`}
                              className="px-2.5 py-1 rounded-md text-xs font-medium transition"
                              style={{ background: "rgba(255,90,54,0.12)", color: "#FF5A36" }}>
                              Renew
                            </Link>
                            <a href={`https://wa.me/91${m.phone}`} target="_blank" rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-md text-xs font-medium transition"
                              style={{ background: "var(--bg-card-2)", color: "var(--text-muted)" }}>
                              WhatsApp
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Animate>
        )}
      </Layout>

      {selectedMember && (
        <MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} onRemoved={fetchMembers} />
      )}
    </>
  );
}
