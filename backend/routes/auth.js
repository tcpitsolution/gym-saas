const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Gym = require("../models/Gym");

const router = express.Router();

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post("/owner/signup", async (req, res) => {
  try {
    const { gymName, name, email, password } = req.body;

    if (!gymName?.trim()) return res.status(400).json({ error: "Gym name is required" });
    if (!name?.trim()) return res.status(400).json({ error: "Owner name is required" });
    if (!email?.trim() || !isValidEmail(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: "Email already used" });

    const gym = await Gym.create({ name: gymName });
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      gymId: gym._id,
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role: "owner",
    });

    const token = jwt.sign(
      { userId: user._id, gymId: gym._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !isValidEmail(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (email.toLowerCase().trim() === adminEmail) {
      if (password.trim() !== adminPassword) return res.status(400).json({ error: "Invalid credentials" });
      const token = jwt.sign(
        { role: "superadmin", email: adminEmail },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ token });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    if (!user.active) return res.status(403).json({ error: "Account is inactive. Contact admin." });

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (user.otpVerifiedAt && user.otpVerifiedAt > twentyFourHoursAgo) {
      const gym = await Gym.findById(user.gymId);
      const token = jwt.sign(
        { userId: user._id, gymId: user.gymId, role: user.role, ownerName: user.name, gymName: gym?.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
      return res.json({ token });
    }

    const { sendOtp } = require("../services/otpService");
    await sendOtp(user.email);
    res.json({ otpRequired: true, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const { verifyOtp } = require("../services/otpService");
    const result = verifyOtp(email, otp);
    if (!result.success) return res.status(400).json({ error: result.message });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "User not found" });

    user.otpVerifiedAt = new Date();
    await user.save();

    const gym = await Gym.findById(user.gymId);
    const token = jwt.sign(
      { userId: user._id, gymId: user.gymId, role: user.role, ownerName: user.name, gymName: gym?.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot password — check email in DB, send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    if (email.toLowerCase().trim() === process.env.ADMIN_EMAIL?.toLowerCase().trim()) {
      return res.status(400).json({ error: "Contact admin to reset this account" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: "No account found with this email. Contact admin." });

    const { sendOtp } = require("../services/otpService");
    await sendOtp(user.email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password — OTP already verified on frontend, just update password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: "All fields required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpVerifiedAt = new Date();
    await user.save();

    const { sendEmail } = require("../services/emailService");
    await sendEmail(
      user.email,
      "Your FlexOps password has been reset",
      `<div style="font-family:sans-serif;padding:20px;max-width:480px;">
        <h2>Password Reset Successful</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your FlexOps account password has been successfully reset.</p>
        <p>Your new password: <strong style="font-size:1.1rem;letter-spacing:2px;">${newPassword}</strong></p>
        <p>You can now log in at <a href="https://flexops.in/login">flexops.in/login</a> with your new password.</p>
        <p style="color:#888;font-size:12px;">If you did not request this, contact admin immediately.</p>
      </div>`
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
