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
