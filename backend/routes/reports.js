const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Member = require("../models/Member");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const Penalty = require("../models/Penalty");

const router = express.Router();

function lastNDays(n) {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().split("T")[0]);
  }
  return result;
}

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeMembers = await Member.countDocuments({ gymId, status: "active" });
    const expiringSoonMembers = await Member.countDocuments({ gymId, membershipEnd: { $gte: now, $lte: sevenDaysFromNow } });
    const newMembersThisMonth = await Member.countDocuments({ gymId, createdAt: { $gte: startOfMonth } });
    const churnedMembers = await Member.countDocuments({ gymId, status: "expired", membershipEnd: { $gte: startOfMonth, $lte: now } });
    const expiredTotal = await Member.countDocuments({ gymId, status: "expired" });

    const renewalRate =
      activeMembers + expiredTotal > 0
        ? Math.round((activeMembers / (activeMembers + expiredTotal)) * 100)
        : 100;

    const revenueAgg = await Payment.aggregate([
      { $match: { gymId, status: "paid", date: { $gte: thirtyDaysAgo, $lte: now } } },
      { $group: { _id: null, total: { $sum: "$amount" }, penaltyTotal: { $sum: "$penaltyAmount" } } },
    ]);

    const pendingDuesAgg = await Penalty.aggregate([
      { $match: { gymId, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const revenueTrendRaw = await Payment.aggregate([
      { $match: { gymId, status: "paid", date: { $gte: sevenDaysAgo, $lte: now } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, total: { $sum: "$amount" } } },
    ]);

    const attendanceTrendRaw = await Attendance.aggregate([
      { $match: { gymId, checkInTime: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkInTime" } }, count: { $sum: 1 } } },
    ]);

    const newMembersTrendRaw = await Member.aggregate([
      { $match: { gymId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    ]);

    const trendDays = lastNDays(7);
    const revenueMap = Object.fromEntries(revenueTrendRaw.map((r) => [r._id, r.total]));
    const attendanceMap = Object.fromEntries(attendanceTrendRaw.map((r) => [r._id, r.count]));
    const newMembersMap = Object.fromEntries(newMembersTrendRaw.map((r) => [r._id, r.count]));

    const revenueTrend = trendDays.map((d) => ({ day: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }), revenue: revenueMap[d] || 0 }));
    const attendanceTrend = trendDays.map((d) => ({ day: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }), checkins: attendanceMap[d] || 0 }));
    const newMembersTrend = trendDays.map((d) => ({ day: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }), count: newMembersMap[d] || 0 }));

    const expiringList = await Member.find({ gymId, membershipEnd: { $gte: now, $lte: sevenDaysFromNow } }).select("name phone membershipEnd");

    const recentAttendance = await Attendance.aggregate([
      { $match: { gymId, checkInTime: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$memberId" } },
    ]);
    const recentlyVisitedIds = new Set(recentAttendance.map((a) => a._id.toString()));
    const activeMemberList = await Member.find({ gymId, status: "active" }).select("name phone");
    const noVisitList = activeMemberList.filter((m) => !recentlyVisitedIds.has(m._id.toString()));

    const overduePenalties = await Penalty.find({ gymId, status: "pending" })
      .populate("memberId", "name phone")
      .select("memberId amount");

    const atRiskMap = new Map();
    expiringList.forEach((m) => {
      atRiskMap.set(m._id.toString(), { memberId: m._id, name: m.name, phone: m.phone, reasons: ["Expiring soon"] });
    });
    noVisitList.forEach((m) => {
      const key = m._id.toString();
      if (atRiskMap.has(key)) atRiskMap.get(key).reasons.push("No visit in 7 days");
      else atRiskMap.set(key, { memberId: m._id, name: m.name, phone: m.phone, reasons: ["No visit in 7 days"] });
    });
    overduePenalties.forEach((p) => {
      if (!p.memberId) return;
      const key = p.memberId._id.toString();
      if (atRiskMap.has(key)) atRiskMap.get(key).reasons.push(`Overdue ₹${p.amount}`);
      else atRiskMap.set(key, { memberId: p.memberId._id, name: p.memberId.name, phone: p.memberId.phone, reasons: [`Overdue ₹${p.amount}`] });
    });

    res.json({
      activeMembers,
      expiringSoonMembers,
      newMembersThisMonth,
      churnedMembers,
      renewalRate,
      revenueLast30Days: revenueAgg[0]?.total || 0,
      penaltyLast30Days: revenueAgg[0]?.penaltyTotal || 0,
      pendingDues: pendingDuesAgg[0]?.total || 0,
      revenueTrend,
      attendanceTrend,
      newMembersTrend,
      atRiskMembers: Array.from(atRiskMap.values()).slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/data", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { type = "revenue", range = "30d" } = req.query;

    const numDays = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - numDays * 24 * 60 * 60 * 1000);

    if (type === "revenue") {
      const rows = await Payment.find({ gymId, date: { $gte: startDate, $lte: now } })
        .populate("memberId", "name")
        .sort({ date: -1 });

      const trendRaw = await Payment.aggregate([
        { $match: { gymId, status: "paid", date: { $gte: startDate, $lte: now } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, total: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]);

      const chartData = trendRaw.map((r) => ({
        date: new Date(r._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: r.total,
      }));

      const totalRevenue = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
      const totalPenalty = rows.reduce((s, r) => s + (r.penaltyAmount || 0), 0);

      return res.json({
        kpis: [
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
          { label: "Total Penalties", value: `₹${totalPenalty.toLocaleString()}` },
          { label: "Transactions", value: rows.length },
        ],
        chartData,
        tableRows: rows.map((r) => ({
          name: r.memberId?.name || "—",
          amount: `₹${r.amount}`,
          mode: r.mode,
          status: r.status,
          date: new Date(r.date).toLocaleDateString("en-IN"),
        })),
        columns: ["name", "amount", "mode", "status", "date"],
      });
    }

    if (type === "attendance") {
      const rows = await Attendance.find({ gymId, checkInTime: { $gte: startDate, $lte: now } })
        .populate("memberId", "name phone")
        .sort({ checkInTime: -1 });

      const trendRaw = await Attendance.aggregate([
        { $match: { gymId, checkInTime: { $gte: startDate, $lte: now } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkInTime" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const chartData = trendRaw.map((r) => ({
        date: new Date(r._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: r.count,
      }));

      const uniqueMembers = new Set(rows.map((r) => r.memberId?._id?.toString())).size;

      return res.json({
        kpis: [
          { label: "Total Check-ins", value: rows.length },
          { label: "Unique Members Visited", value: uniqueMembers },
          { label: "Avg per Day", value: (rows.length / numDays).toFixed(1) },
        ],
        chartData,
        tableRows: rows.map((r) => ({
          name: r.memberId?.name || "—",
          phone: r.memberId?.phone || "—",
          date: new Date(r.checkInTime).toLocaleDateString("en-IN"),
          time: new Date(r.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        })),
        columns: ["name", "phone", "date", "time"],
      });
    }

    if (type === "members") {
      const rows = await Member.find({ gymId, createdAt: { $gte: startDate, $lte: now } })
        .populate("currentPlan", "name")
        .sort({ createdAt: -1 });

      const trendRaw = await Member.aggregate([
        { $match: { gymId, createdAt: { $gte: startDate, $lte: now } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const chartData = trendRaw.map((r) => ({
        date: new Date(r._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: r.count,
      }));

      return res.json({
        kpis: [
          { label: "New Signups", value: rows.length },
          { label: "Active", value: rows.filter((m) => m.status === "active").length },
          { label: "Expired", value: rows.filter((m) => m.status === "expired").length },
        ],
        chartData,
        tableRows: rows.map((r) => ({
          name: r.name,
          phone: r.phone,
          plan: r.currentPlan?.name || "—",
          status: r.status,
          joined: new Date(r.createdAt).toLocaleDateString("en-IN"),
        })),
        columns: ["name", "phone", "plan", "status", "joined"],
      });
    }

    if (type === "renewals") {
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const rows = await Member.find({ gymId, membershipEnd: { $gte: now, $lte: sevenDaysFromNow } })
        .populate("currentPlan", "name")
        .sort({ membershipEnd: 1 });

      return res.json({
        kpis: [
          { label: "Expiring in 7 Days", value: rows.length },
          { label: "Plans Involved", value: new Set(rows.map((r) => r.currentPlan?.name)).size },
          { label: "", value: "" },
        ],
        chartData: [],
        tableRows: rows.map((r) => ({
          name: r.name,
          phone: r.phone,
          plan: r.currentPlan?.name || "—",
          ends: new Date(r.membershipEnd).toLocaleDateString("en-IN"),
        })),
        columns: ["name", "phone", "plan", "ends"],
      });
    }

    res.status(400).json({ error: "Invalid report type" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
