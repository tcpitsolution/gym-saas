const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Payment = require("../models/Payment");
const Penalty = require("../models/Penalty");
const { sendMessage } = require("../services/messageService");

const router = express.Router();

// List payments with filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { search, mode, status, from, to } = req.query;

    const query = { gymId };
    if (mode) query.mode = mode;
    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let payments = await Payment.find(query)
      .populate("memberId", "name phone email")
      .populate("planId", "name")
      .sort({ date: -1 });

    if (search) {
      const s = search.toLowerCase();
      payments = payments.filter((p) =>
        p.memberId?.name?.toLowerCase().includes(s),
      );
    }

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summary — collected, pending, overdue, transaction count
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;

    const collectedAgg = await Payment.aggregate([
      { $match: { gymId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const pendingAgg = await Payment.aggregate([
      { $match: { gymId, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const overdueAgg = await Penalty.aggregate([
      { $match: { gymId, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    res.json({
      collectedTotal: collectedAgg[0]?.total || 0,
      pendingTotal: pendingAgg[0]?.total || 0,
      pendingCount: pendingAgg[0]?.count || 0,
      overdueTotal: overdueAgg[0]?.total || 0,
      overdueCount: overdueAgg[0]?.count || 0,
      transactionCount: collectedAgg[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a pending payment as paid
router.patch("/:id/mark-paid", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, gymId },
      { status: "paid", date: new Date() },
      { new: true },
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a payment reminder to the member
router.post("/:id/remind", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const payment = await Payment.findOne({
      _id: req.params.id,
      gymId,
    }).populate("memberId");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (!payment.memberId?.email)
      return res.status(400).json({ error: "Member has no email on file" });

    const message = await sendMessage({
      gymId,
      memberId: payment.memberId._id,
      email: payment.memberId.email,
      subject: "Payment Reminder",
      content: `Hi ${payment.memberId.name}, this is a reminder that ₹${payment.amount} is pending. Please clear your dues at your earliest convenience.`,
      type: "reminder",
    });

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
