import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const reportTypes = [
  { key: "revenue", label: "Revenue" },
  { key: "attendance", label: "Attendance" },
  { key: "members", label: "Members" },
  { key: "renewals", label: "Renewals / Expiring" },
];

const ranges = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("revenue");
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/data", {
        params: { type: reportType, range },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, range]);

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/exports/report", {
        params: { type: reportType },
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              Reports
            </h1>
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>
              Detailed analytics and insights
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-outline px-5 py-2.5 text-sm"
          >
            ⬇ Export CSV
          </button>
        </div>
      </Animate>

      {/* Filters */}
      <Animate variant="fadeUp" delay={60}>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div
            className="flex gap-1 p-1 rounded-lg"
            style={{ background: "var(--bg-card)" }}
          >
            {reportTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => setReportType(t.key)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition"
                style={
                  reportType === t.key
                    ? { background: "#FF5A36", color: "#fff" }
                    : { color: "var(--text-muted)" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className="flex gap-1 p-1 rounded-lg"
            style={{ background: "var(--bg-card)" }}
          >
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition"
                style={
                  range === r.key
                    ? { background: "#2DD4C4", color: "#0E1011" }
                    : { color: "var(--text-muted)" }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </Animate>

      {loading ? (
        <div
          className="flex items-center gap-3"
          style={{ color: "var(--text-faint)" }}
        >
          <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : !data ? (
        <div
          className="text-center py-20"
          style={{ color: "var(--text-faint)" }}
        >
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm">Failed to load report data.</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <Animate variant="fadeUp" delay={120}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {data.kpis
                .filter((k) => k.label)
                .map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl p-5"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p
                      className="text-2xl font-black"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "#FF5A36",
                      }}
                    >
                      {kpi.value}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {kpi.label}
                    </p>
                  </div>
                ))}
            </div>
          </Animate>

          {/* Chart */}
          {data.chartData.length > 0 && (
            <Animate variant="fadeUp" delay={180}>
              <div
                className="rounded-2xl p-6 mb-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  className="font-semibold text-lg mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Trend
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="date"
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
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "0.75rem",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#FF5A36"
                      strokeWidth={2.5}
                      dot={{ fill: "#FF5A36", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Animate>
          )}

          {/* Table */}
          <Animate variant="fadeUp" delay={240}>
            <div
              className="rounded-2xl overflow-hidden overflow-x-auto"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {data.tableRows.length === 0 ? (
                <div
                  className="text-center py-16"
                  style={{ color: "var(--text-faint)" }}
                >
                  <p className="text-4xl mb-3">📊</p>
                  <p className="text-sm">No data for this period.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        background: "var(--bg-card-2)",
                      }}
                    >
                      {data.columns.map((col) => (
                        <th
                          key={col}
                          className="text-left px-5 py-3.5 font-semibold capitalize whitespace-nowrap"
                          style={{
                            color: "var(--text-faint)",
                            fontSize: "0.75rem",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.tableRows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-card-2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {data.columns.map((col) => (
                          <td
                            key={col}
                            className="px-5 py-3.5"
                            style={{
                              color:
                                col === "name"
                                  ? "var(--text-primary)"
                                  : "var(--text-muted)",
                            }}
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Animate>
        </>
      )}
    </Layout>
  );
}
