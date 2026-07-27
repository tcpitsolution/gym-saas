const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");

const router = express.Router();

// Check-in
router.post("/checkin", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId, method, notes } = req.body;

    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.status !== "active") return res.status(400).json({ error: "Membership inactive/expired" });

    // Already checked in today?
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ gymId, memberId, checkInAt: { $gte: today }, checkOutAt: null });
    if (existing) return res.status(400).json({ error: "Already checked in today" });

    const record = await Attendance.create({ gymId, memberId, checkInAt: new Date(), method: method || "Manual", notes });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-out
router.post("/checkout/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const record = await Attendance.findOne({ _id: req.params.id, gymId, checkOutAt: null });
    if (!record) return res.status(404).json({ error: "Active check-in not found" });

    record.checkOutAt = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Today's attendance log
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await Attendance.find({ gymId, checkInAt: { $gte: today } })
      .populate("memberId", "name phone")
      .sort({ checkInAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCheckIns, activeNow] = await Promise.all([
      Attendance.countDocuments({ gymId, checkInAt: { $gte: today } }),
      Attendance.countDocuments({ gymId, checkInAt: { $gte: today }, checkOutAt: null }),
    ]);

    const blockedMembers = await Member.countDocuments({ gymId, status: { $in: ["expired", "inactive"] } });

    res.json({ todayCheckIns, activeNow, blocked: blockedMembers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Member attendance history
router.get("/member/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const logs = await Attendance.find({ gymId, memberId: req.params.id }).sort({ checkInAt: -1 }).limit(30);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
