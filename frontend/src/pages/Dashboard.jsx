import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import Animate from "../components/Animate";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
        }}
      >
        <p
          style={{
            color: "var(--text-faint)",
            fontSize: "0.75rem",
            marginBottom: "0.25rem",
          }}
        >
          {label}
        </p>
        <p style={{ color: "#FF5A36", fontWeight: 700, fontSize: "1rem" }}>
          {prefix}
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState([]);
  const [expirySummary, setExpirySummary] = useState(null);
  const { ownerName, gymName } = useAuth();
  useEffect(() => {
    api
      .get("/reports/summary")
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
    api
      .get("/ai/conversations")
      .then((res) => setRecentChats(res.data.slice(0, 4)))
      .catch(() => {});
    api
      .get("/notifications/expiry-summary")
      .then((res) => setExpirySummary(res.data))
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              {gymName || "Overview"}
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Welcome back, {ownerName || "Owner"}
          </p>
        </div>
      </Animate>

      {expirySummary &&
        (expirySummary.expiredToday > 0 || expirySummary.expiringSoon > 0) && (
          <Animate variant="fadeUp" delay={20}>
            <div
              className="rounded-2xl p-4 mb-6 flex items-center gap-3"
              style={{
                background: "rgba(255,90,54,0.1)",
                border: "1px solid rgba(255,90,54,0.3)",
              }}
            >
              <span className="text-xl">⚠️</span>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {expirySummary.expiredToday > 0 && (
                  <>
                    <strong>{expirySummary.expiredToday}</strong> membership
                    {expirySummary.expiredToday > 1 ? "s" : ""} expired
                    today.{" "}
                  </>
                )}
                {expirySummary.expiringSoon > 0 && (
                  <>
                    <strong>{expirySummary.expiringSoon}</strong> more expiring
                    in the next 7 days.
                  </>
                )}
              </p>
            </div>
          </Animate>
        )}

      {loading ? (
        <div
          className="flex items-center gap-3 animate-fade-in"
          style={{ color: "var(--text-faint)" }}
        >
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Active Members",
                value: summary.activeMembers,
                tone: "good",
              },
              {
                label: "New This Month",
                value: summary.newMembersThisMonth,
                tone: "good",
              },
              {
                label: "Expiring This Week",
                value: summary.expiringSoonMembers,
                tone: "warn",
              },
              {
                label: "Churned This Month",
                value: summary.churnedMembers,
                tone: "warn",
              },
            ].map((s, i) => (
              <Animate key={s.label} variant="fadeUp" delay={i * 60}>
                <StatCard label={s.label} value={s.value} tone={s.tone} />
              </Animate>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Renewal Rate",
                value: `${summary.renewalRate}%`,
                tone: "default",
              },
              {
                label: "Revenue (30d)",
                value: `₹${summary.revenueLast30Days}`,
                tone: "default",
              },
              {
                label: "Penalties (30d)",
                value: `₹${summary.penaltyLast30Days}`,
                tone: "warn",
              },
              {
                label: "Pending Dues",
                value: `₹${summary.pendingDues}`,
                tone: "warn",
              },
            ].map((s, i) => (
              <Animate key={s.label} variant="fadeUp" delay={280 + i * 60}>
                <StatCard label={s.label} value={s.value} tone={s.tone} />
              </Animate>
            ))}
          </div>

          {/* Trend charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Animate variant="fadeUp" delay={560}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="font-semibold text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Revenue Trend
                  </h2>
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(255,90,54,0.12)",
                      color: "#FF5A36",
                      fontWeight: 600,
                    }}
                  >
                    Last 7 days
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={summary.revenueTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--text-faint)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-faint)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FF5A36"
                      strokeWidth={2.5}
                      dot={{ fill: "#FF5A36", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#FF5A36" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Animate>

            <Animate variant="fadeUp" delay={620}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="font-semibold text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Attendance Trend
                  </h2>
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(45,212,196,0.12)",
                      color: "#2DD4C4",
                      fontWeight: 600,
                    }}
                  >
                    Last 7 days
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={summary.attendanceTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--text-faint)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-faint)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="checkins"
                      stroke="#2DD4C4"
                      strokeWidth={2.5}
                      dot={{ fill: "#2DD4C4", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#2DD4C4" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Animate>
          </div>

          {/* At-risk members */}
          <Animate variant="fadeUp" delay={680}>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h2
                className="font-semibold text-lg mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                At-Risk Members
              </h2>
              <p
                className="text-xs mb-5"
                style={{ color: "var(--text-faint)" }}
              >
                Expiring soon, no recent visits, or overdue payments
              </p>

              {summary.atRiskMembers.length === 0 ? (
                <p
                  className="text-sm py-6 text-center"
                  style={{ color: "var(--text-faint)" }}
                >
                  No at-risk members right now 🎉
                </p>
              ) : (
                <div className="space-y-2">
                  {summary.atRiskMembers.map((m) => (
                    <div
                      key={m.memberId}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: "var(--bg-card-2)" }}
                    >
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {m.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {m.phone}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {m.reasons.map((r) => (
                          <span
                            key={r}
                            className="text-[10px] px-2 py-1 rounded-full font-medium"
                            style={{
                              background: "rgba(255,90,54,0.12)",
                              color: "#FF5A36",
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Animate>

          {/* Ask AI shortcut */}
          <Animate variant="fadeUp" delay={740}>
            <Link
              to="/ask-ai"
              className="rounded-2xl p-5 flex items-center gap-4 transition group"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--brand-orange)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "rgba(255,90,54,0.12)" }}
              >
                🤖
              </div>
              <div className="flex-1">
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ask AI
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Ask about members, revenue, fitness tips &amp; more
                </p>
              </div>
              <span style={{ color: "var(--text-faint)", fontSize: "1.2rem" }}>
                →
              </span>
            </Link>
          </Animate>

          {/* Recent AI chats */}
          {recentChats.length > 0 && (
            <Animate variant="fadeUp" delay={780}>
              <div
                className="rounded-2xl p-6 mt-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="font-semibold text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Recent AI Chats
                  </h2>
                  <Link
                    to="/ask-ai"
                    className="text-xs"
                    style={{
                      color: "var(--brand-orange)",
                      textDecoration: "none",
                    }}
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {recentChats.map((c) => (
                    <Link
                      key={c._id}
                      to={`/ask-ai?c=${c._id}`}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition"
                      style={{
                        background: "var(--bg-card-2)",
                        textDecoration: "none",
                        border: "1px solid var(--border-subtle)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--brand-orange)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--border-subtle)";
                      }}
                    >
                      <span className="text-sm shrink-0">💬</span>
                      <span
                        className="truncate text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {c.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Animate>
          )}
        </>
      )}
    </Layout>
  );
}
