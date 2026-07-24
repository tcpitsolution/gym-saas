const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Gym = require("../models/Gym");

const router = express.Router();

router.post("/owner/signup", async (req, res) => {
  try {
    const { gymName, name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already used" });

    const gym = await Gym.create({ name: gymName });
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      gymId: gym._id,
      name,
      email,
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

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, gymId: user.gymId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
