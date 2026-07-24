const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Payment = require("../models/Payment");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { name, phone, email, planId, startDate, amount, mode } = req.body;

    const plan = await MembershipPlan.findOne({ _id: planId, gymId });
    if (!plan) return res.status(400).json({ error: "Plan not found" });

    const start = new Date(startDate || Date.now());
    const end = new Date(
      start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    const member = await Member.create({
      gymId,
      name,
      phone,
      email,
      currentPlan: plan._id,
      membershipStart: start,
      membershipEnd: end,
      status: "active",
    });

    await Payment.create({
      gymId,
      memberId: member._id,
      planId: plan._id,
      amount,
      mode,
      status: "paid",
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { status, search } = req.query;

    const query = { gymId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const member = await Member.findOne({ _id: req.params.id, gymId });
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/renew", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { planId, startDate, amount, penaltyAmount = 0, mode } = req.body;

    const member = await Member.findOne({ _id: req.params.id, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });

    const plan = await MembershipPlan.findOne({ _id: planId, gymId });
    if (!plan) return res.status(400).json({ error: "Plan not found" });

    const start = new Date(startDate || Date.now());
    const end = new Date(
      start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    member.currentPlan = plan._id;
    member.membershipStart = start;
    member.membershipEnd = end;
    member.status = "active";
    await member.save();

    await Payment.create({
      gymId,
      memberId: member._id,
      planId: plan._id,
      amount,
      penaltyAmount,
      mode,
      status: "paid",
    });

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
