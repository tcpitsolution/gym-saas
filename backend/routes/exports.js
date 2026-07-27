const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { toCSV } = require("../services/exportService");
const Member = require("../models/Member");
const Payment = require("../models/Payment");

const router = express.Router();

router.get("/members", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const members = await Member.find({ gymId }).lean();

    const rows = members.map((m) => ({
      name: m.name,
      phone: m.phone,
      email: m.email || "",
      status: m.status,
      membershipStart: m.membershipStart,
      membershipEnd: m.membershipEnd,
    }));

    const csv = toCSV(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("members.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Generic CSV export by report type (reuses same data as /reports/data)
router.get("/report", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { type = "revenue" } = req.query;

    const axios_internal_note = null; // placeholder, real logic below reuses models directly
    const Member = require("../models/Member");
    const Payment = require("../models/Payment");
    const Attendance = require("../models/Attendance");

    let rows = [];
    if (type === "revenue") {
      const data = await Payment.find({ gymId }).populate("memberId", "name").sort({ date: -1 }).limit(500);
      rows = data.map((r) => ({
        name: r.memberId?.name || "—",
        amount: r.amount,
        mode: r.mode,
        status: r.status,
        date: new Date(r.date).toLocaleDateString("en-IN"),
      }));
    } else if (type === "attendance") {
      const data = await Attendance.find({ gymId }).populate("memberId", "name phone").sort({ checkInTime: -1 }).limit(500);
      rows = data.map((r) => ({
        name: r.memberId?.name || "—",
        phone: r.memberId?.phone || "—",
        date: new Date(r.checkInTime).toLocaleDateString("en-IN"),
      }));
    } else if (type === "members") {
      const data = await Member.find({ gymId }).populate("currentPlan", "name").sort({ createdAt: -1 });
      rows = data.map((r) => ({
        name: r.name,
        phone: r.phone,
        plan: r.currentPlan?.name || "—",
        status: r.status,
      }));
    }

    const csv = toCSV(rows);
    res.header("Content-Type", "text/csv");
    res.attachment(`${type}-report.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/payments", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const payments = await Payment.find({ gymId }).lean();

    const rows = payments.map((p) => ({
      memberId: p.memberId,
      amount: p.amount,
      penaltyAmount: p.penaltyAmount,
      mode: p.mode,
      status: p.status,
      date: p.date,
    }));

    const csv = toCSV(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("payments.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
