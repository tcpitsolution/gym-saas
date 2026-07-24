import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import Animate from "../components/Animate";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{label}</p>
        <p style={{ color: "#FF5A36", fontWeight: 700, fontSize: "1rem" }}>₹{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/summary")
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  const chartData = summary
    ? [
        { day: "Mon", revenue: 0 },
        { day: "Tue", revenue: 0 },
        { day: "Wed", revenue: 0 },
        { day: "Thu", revenue: 0 },
        { day: "Fri", revenue: 0 },
        { day: "Sat", revenue: 0 },
        { day: "Today", revenue: summary.revenueLast30Days },
      ]
    : [];

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="mb-8">
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
            Overview
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Your gym at a glance</p>
        </div>
      </Animate>

      {loading ? (
        <div className="flex items-center gap-3 animate-fade-in" style={{ color: "rgba(255,255,255,0.4)" }}>
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Members", value: summary.activeMembers, tone: "good" },
              { label: "Expiring This Week", value: summary.expiringSoonMembers, tone: "warn" },
              { label: "Revenue (30 days)", value: `₹${summary.revenueLast30Days}`, tone: "default" },
              { label: "Penalties (30 days)", value: `₹${summary.penaltyLast30Days}`, tone: "warn" },
            ].map((s, i) => (
              <Animate key={s.label} variant="fadeUp" delay={i * 80}>
                <StatCard label={s.label} value={s.value} tone={s.tone} />
              </Animate>
            ))}
          </div>

          <Animate variant="fadeUp" delay={320}>
            <div
              className="rounded-2xl p-6"
              style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg" style={{ color: "#fff", fontFamily: "var(--font-body)" }}>
                  Revenue Trend
                </h2>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,90,54,0.12)", color: "#FF5A36", fontWeight: 600 }}>
                  Last 7 days
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FF5A36" />
                      <stop offset="100%" stopColor="#ff8c42" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#lineGrad)"
                    strokeWidth={2.5}
                    dot={{ fill: "#FF5A36", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#FF5A36", boxShadow: "0 0 12px rgba(255,90,54,0.6)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Animate>
        </>
      )}
    </Layout>
  );
}
