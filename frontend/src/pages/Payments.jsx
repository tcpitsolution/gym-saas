  import { useEffect, useState } from "react";
  import api from "../api/axios";
  import Layout from "../components/Layout";
  import Animate from "../components/Animate";
  import { useToast } from "../context/ToastContext";

  const modeColor = {
    cash: "#2DD4C4",
    upi: "#a78bfa",
    card: "#f59e0b",
    online: "#60a5fa",
    default: "#FF5A36",
  };

  export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modeFilter, setModeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [actionId, setActionId] = useState(null);
    const toast = useToast();

    const fetchData = async () => {
      setLoading(true);
      try {
        const [paymentsRes, summaryRes] = await Promise.all([
          api.get("/payments", {
            params: { search, mode: modeFilter, status: statusFilter, from, to },
          }),
          api.get("/payments/summary"),
        ]);
        setPayments(paymentsRes.data || []);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [modeFilter, statusFilter]);

    const handleSearch = (e) => {
      e.preventDefault();
      fetchData();
    };

    const handleMarkPaid = async (id) => {
      setActionId(id);
      try {
        await api.patch(`/payments/${id}/mark-paid`);
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to mark as paid");
      } finally {
        setActionId(null);
      }
    };

    const handleRemind = async (id) => {
      setActionId(id);
      try {
        await api.post(`/payments/${id}/remind`);
        toast.success("Reminder sent successfully!");
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to send reminder");
      } finally {
        setActionId(null);
      }
    };

    return (
      <Layout>
        <Animate variant="fadeUp">
          <div className="mb-8">
            <h1
              className="text-3xl mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "var(--text-primary)",
              }}
            >
              Payments
            </h1>
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>
              All payment records for your gym
            </p>
          </div>
        </Animate>

        {/* Summary cards */}
        {summary && (
          <Animate variant="fadeUp" delay={80}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Collected",
                  value: `₹${summary.collectedTotal.toLocaleString()}`,
                  color: "#FF5A36",
                },
                {
                  label: "Pending Due",
                  value: `₹${summary.pendingTotal.toLocaleString()}`,
                  sub: `${summary.pendingCount} payments`,
                  color: "#f59e0b",
                },
                {
                  label: "Overdue (Penalties)",
                  value: `₹${summary.overdueTotal.toLocaleString()}`,
                  sub: `${summary.overdueCount} members`,
                  color: "#ef4444",
                },
                {
                  label: "Transactions",
                  value: summary.transactionCount,
                  color: "#2DD4C4",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl p-5"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <p
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-display)", color: c.color }}
                  >
                    {c.value}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {c.label}
                  </p>
                  {c.sub && (
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {c.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Animate>
        )}

        {/* Filters */}
        <Animate variant="fadeUp" delay={130}>
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <input
              type="text"
              placeholder="Search by member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-premium"
              style={{ maxWidth: "140px" }}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="input-premium"
              style={{ maxWidth: "140px" }}
            >
              <option value="">All Modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input-premium"
              style={{ maxWidth: "150px" }}
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input-premium"
              style={{ maxWidth: "150px" }}
            />
            <button type="submit" className="btn-outline px-5 py-2.5 text-sm">
              Apply
            </button>
          </form>
        </Animate>

        {loading ? (
          <div
            className="flex items-center gap-3"
            style={{ color: "var(--text-faint)" }}
          >
            <div className="w-5 h-5 border-2 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : payments.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ color: "var(--text-faint)" }}
          >
            <p className="text-5xl mb-4">💳</p>
            <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>
              No payments found.
            </p>
          </div>
        ) : (
          <Animate variant="fadeUp" delay={180}>
            <div
              className="rounded-2xl overflow-hidden overflow-x-auto"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: "var(--bg-card-2)",
                    }}
                  >
                    {[
                      "Member",
                      "Plan",
                      "Amount",
                      "Mode",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 font-semibold whitespace-nowrap"
                        style={{
                          color: "var(--text-faint)",
                          fontSize: "0.75rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p._id}
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-card-2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        className="px-5 py-3.5 font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.memberId?.name || "—"}
                      </td>
                      <td
                        className="px-5 py-3.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {p.planId?.name || "—"}
                      </td>
                      <td
                        className="px-5 py-3.5 font-bold"
                        style={{ color: "#FF5A36" }}
                      >
                        ₹{p.amount}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{
                            background: `${modeColor[p.mode] || modeColor.default}18`,
                            color: modeColor[p.mode] || modeColor.default,
                          }}
                        >
                          {p.mode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={
                            p.status === "paid"
                              ? {
                                  background: "rgba(45,212,196,0.12)",
                                  color: "#2DD4C4",
                                }
                              : {
                                  background: "rgba(245,158,11,0.12)",
                                  color: "#f59e0b",
                                }
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(p.date || p.createdAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkPaid(p._id)}
                              disabled={actionId === p._id}
                              className="px-2.5 py-1 rounded-md text-xs font-medium transition disabled:opacity-40"
                              style={{
                                background: "rgba(45,212,196,0.12)",
                                color: "#2DD4C4",
                              }}
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleRemind(p._id)}
                              disabled={actionId === p._id}
                              className="px-2.5 py-1 rounded-md text-xs font-medium transition disabled:opacity-40"
                              style={{
                                background: "rgba(245,158,11,0.12)",
                                color: "#f59e0b",
                              }}
                            >
                              Remind
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{ color: "var(--text-faint)" }}
                            className="text-xs"
                          >
                            —
                          </span>
                        )}
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
