const express = require("express");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middleware/auth");
const User = require("../models/User");
const Gym = require("../models/Gym");
const { sendEmail, newTrainerWelcomeEmail } = require("../services/emailService");
const { sendOtp } = require("../services/otpService");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const trainers = await User.find({ gymId, role: "trainer" }).select("name email phone alternatePhone address aadharNumber panNumber joiningDate active createdAt");
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { gymId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({ error: "Not allowed" });

    const { name, email, phone, alternatePhone, address, aadharNumber, panNumber, joiningDate, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const trainer = await User.create({
      gymId, name, email, password: hashed, role: "trainer",
      phone: phone || "",
      alternatePhone: alternatePhone || "",
      address: address || "",
      aadharNumber: aadharNumber || "",
      panNumber: panNumber || "",
      joiningDate: joiningDate || new Date(),
    });

    // Send welcome email with credentials + OTP
    const gym = await Gym.findById(gymId);
    const { subject, html } = newTrainerWelcomeEmail(trainer, gym?.name || "Your Gym", password);
    sendEmail(trainer.email, subject, html);
    sendOtp(trainer.email).catch(() => {});

    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({ error: "Not allowed" });

    const trainer = await User.findOneAndDelete({ _id: req.params.id, gymId, role: "trainer" });
    if (!trainer) return res.status(404).json({ error: "Trainer not found" });

    res.json({ message: "Trainer removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
