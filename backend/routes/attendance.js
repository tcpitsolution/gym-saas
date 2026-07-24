const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");

const router = express.Router();

router.post("/checkin", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId } = req.body;

    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.status !== "active") {
      return res.status(400).json({ error: "Membership inactive/expired" });
    }

    const record = await Attendance.create({
      gymId,
      memberId,
      checkInTime: new Date(),
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/member/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const logs = await Attendance.find({
      gymId,
      memberId: req.params.id,
    }).sort({ checkInTime: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
