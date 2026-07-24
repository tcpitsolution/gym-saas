import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Animate from "../components/Animate";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members", { params: { search } });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchMembers(); };

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
              Members
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Manage all your gym members</p>
          </div>
          <Link
            to="/members/new"
            className="btn-primary"
          >
            + Add Member
          </Link>
        </div>
      </Animate>

      <Animate variant="fadeUp" delay={100}>
        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium max-w-sm"
          />
          <button type="submit" className="btn-outline px-5 py-2.5 text-sm">
            Search
          </button>
        </form>
      </Animate>

      {loading ? (
        <div className="flex items-center gap-3 animate-fade-in" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : members.length === 0 ? (
        <Animate variant="fadeUp">
          <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg font-medium text-white/50">No members yet.</p>
            <p className="text-sm mt-1">Add your first member to get started!</p>
          </div>
        </Animate>
      ) : (
        <Animate variant="fadeUp" delay={200}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  {["Name", "Phone", "Status", "Membership Ends"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr
                    key={m._id}
                    className="transition-colors duration-150"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      animationDelay: `${i * 40}ms`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-3.5 font-medium" style={{ color: "#fff" }}>{m.name}</td>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.5)" }}>{m.phone}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          m.status === "active"
                            ? { background: "rgba(45,212,196,0.12)", color: "#2DD4C4" }
                            : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }
                        }
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {m.membershipEnd ? new Date(m.membershipEnd).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Animate>
      )}
    </Layout>
  );
}
