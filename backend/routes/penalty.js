const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Penalty = require("../models/Penalty");
const Member = require("../models/Member");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId, amount, reason, daysLate } = req.body;

    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });

    const penalty = await Penalty.create({
      gymId,
      memberId,
      amount,
      reason,
      daysLate,
    });
    res.status(201).json(penalty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId, status } = req.query;

    const query = { gymId };
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;

    const penalties = await Penalty.find(query).sort({ createdAt: -1 });
    res.json(penalties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { status } = req.body;

    const penalty = await Penalty.findOneAndUpdate(
      { _id: req.params.id, gymId },
      { status },
      { new: true },
    );

    if (!penalty) return res.status(404).json({ error: "Penalty not found" });
    res.json(penalty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
