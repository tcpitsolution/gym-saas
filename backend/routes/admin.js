const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Gym = require("../models/Gym");
const Member = require("../models/Member");
const Payment = require("../models/Payment");
const DemoRequest = require("../models/DemoRequest");
const AdminPlan = require("../models/AdminPlan");
const { authMiddleware } = require("../middleware/auth");
const { sendEmail, newGymOwnerWelcomeEmail, demoRequestUserEmail, demoRequestAdminEmail } = require("../services/emailService");

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin") return res.status(403).json({ error: "Admin only" });
  next();
};

// Seed default plans if none exist
async function seedPlans() {
  const count = await AdminPlan.countDocuments();
  if (count === 0) {
    await AdminPlan.insertMany([
      { key: "1month", label: "1 Month Plan",  price: 999,  duration: 30,  desc: "Best for trial gyms" },
      { key: "3month", label: "3 Month Plan",  price: 2499, duration: 90,  desc: "Most popular choice" },
      { key: "1year",  label: "1 Year Plan",   price: 7999, duration: 365, desc: "Best value for money" },
    ]);
  }
}
seedPlans();

const getPlanMap = async () => {
  const plans = await AdminPlan.find({ active: true });
  const durations = {}, amounts = {};
  plans.forEach((p) => { durations[p.key] = p.duration; amounts[p.key] = p.price; });
  return { durations, amounts };
};

// Submit demo request (public)
router.post("/demo-request", async (req, res) => {
  try {
    const { gymName, ownerName, email, phone, message } = req.body;
    if (!gymName || !ownerName || !email) return res.status(400).json({ error: "Required fields missing" });
    const demo = await DemoRequest.create({ gymName, ownerName, email, phone, message });

    // Email to user
    const userMail = demoRequestUserEmail(ownerName, gymName);
    sendEmail(email, userMail.subject, userMail.html);

    // Email to admin
    const adminMail = demoRequestAdminEmail(ownerName, gymName, email, phone, message);
    sendEmail(process.env.ADMIN_EMAIL, adminMail.subject, adminMail.html);

    res.status(201).json({ success: true, id: demo._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL) return res.status(400).json({ error: "Invalid credentials" });
    if (password !== process.env.ADMIN_PASSWORD) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ role: "superadmin", email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all demo requests
router.get("/demo-requests", authMiddleware, adminOnly, async (req, res) => {
  try {
    const requests = await DemoRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update demo request status
router.patch("/demo-requests/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const demo = await DemoRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(demo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create gym owner account
router.post("/create-gym-owner", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { gymName, ownerName, email, password, phone, address, subscriptionPlan = "1month" } = req.body;
    if (!gymName || !ownerName || !email || !password) return res.status(400).json({ error: "Required fields missing" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already used" });

    const { durations, amounts } = await getPlanMap();
    if (!durations[subscriptionPlan]) return res.status(400).json({ error: "Invalid plan" });

    const days = durations[subscriptionPlan];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const gym = await Gym.create({
      name: gymName, phone, address, email,
      subscription: { plan: subscriptionPlan, status: "active", startDate, endDate, amount: amounts[subscriptionPlan] },
    });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ gymId: gym._id, name: ownerName, email, password: hashed, role: "owner" });

    const { subject, html } = newGymOwnerWelcomeEmail(ownerName, gymName, email, password);
    await sendEmail(email, subject, html);

    res.status(201).json({ success: true, userId: user._id, gymId: gym._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all gyms with owner info + subscription
router.get("/gyms", authMiddleware, adminOnly, async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    const result = await Promise.all(
      gyms.map(async (gym) => {
        const owner = await User.findOne({ gymId: gym._id, role: "owner" }).select("name email active phone");
        const memberCount = await Member.countDocuments({ gymId: gym._id });
        return { ...gym.toObject(), owner, memberCount };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle gym owner active/inactive (block/unblock)
router.patch("/gyms/:gymId/toggle", authMiddleware, adminOnly, async (req, res) => {
  try {
    const owner = await User.findOne({ gymId: req.params.gymId, role: "owner" });
    if (!owner) return res.status(404).json({ error: "Owner not found" });
    owner.active = !owner.active;
    await owner.save();
    res.json({ active: owner.active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete gym + owner
router.delete("/gyms/:gymId", authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.deleteMany({ gymId: req.params.gymId });
    await Gym.findByIdAndDelete(req.params.gymId);
    res.json({ message: "Gym removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change subscription plan
router.patch("/gyms/:gymId/subscription", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { plan } = req.body;
    const { durations, amounts } = await getPlanMap();
    if (!durations[plan]) return res.status(400).json({ error: "Invalid plan" });

    const days = durations[plan];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const gym = await Gym.findByIdAndUpdate(
      req.params.gymId,
      { subscription: { plan, status: "active", startDate, endDate, amount: amounts[plan] } },
      { new: true }
    );
    if (!gym) return res.status(404).json({ error: "Gym not found" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin Plans CRUD ──────────────────────────────────────

// Get all admin plans
router.get("/plans", authMiddleware, adminOnly, async (req, res) => {
  try {
    const plans = await AdminPlan.find().sort({ duration: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new plan
router.post("/plans", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { key, label, price, duration, desc } = req.body;
    if (!key || !label || !price || !duration) return res.status(400).json({ error: "key, label, price, duration required" });
    const existing = await AdminPlan.findOne({ key });
    if (existing) return res.status(400).json({ error: "Plan key already exists" });
    const plan = await AdminPlan.create({ key, label, price: Number(price), duration: Number(duration), desc });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update plan
router.patch("/plans/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { label, price, duration, desc, active } = req.body;
    const plan = await AdminPlan.findByIdAndUpdate(
      req.params.id,
      { label, price: Number(price), duration: Number(duration), desc, active },
      { new: true }
    );
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete plan
router.delete("/plans/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await AdminPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending subscriptions (expired or never set)
router.get("/subscriptions/pending", authMiddleware, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const gyms = await Gym.find({
      $or: [
        { "subscription.status": "pending" },
        { "subscription.status": "expired" },
        { "subscription.endDate": { $lt: now } },
        { "subscription.endDate": { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      gyms.map(async (gym) => {
        const owner = await User.findOne({ gymId: gym._id, role: "owner" }).select("name email phone active");
        return { ...gym.toObject(), owner };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin overview stats
router.get("/stats", authMiddleware, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const gyms = await Gym.find();
    const owners = await User.find({ role: "owner" });
    const totalMembers = await Member.countDocuments();
    const totalRevenue = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    const activeGyms = owners.filter((o) => o.active).length;
    const pendingSubs = gyms.filter((g) =>
      !g.subscription?.endDate || new Date(g.subscription.endDate) < now || g.subscription?.status !== "active"
    ).length;

    // Monthly gym signups (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySignups = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = gyms.filter((g) => new Date(g.createdAt) >= start && new Date(g.createdAt) <= end).length;
      monthlySignups.push({ label, count });
    }

    res.json({
      totalGyms: gyms.length,
      activeGyms,
      pendingSubs,
      totalMembers,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlySignups,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reports export data
router.get("/reports", authMiddleware, adminOnly, async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    const result = await Promise.all(
      gyms.map(async (gym) => {
        const owner = await User.findOne({ gymId: gym._id, role: "owner" }).select("name email phone active");
        const memberCount = await Member.countDocuments({ gymId: gym._id });
        const revenue = await Payment.aggregate([
          { $match: { gymId: gym._id } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return {
          gymName: gym.name,
          ownerName: owner?.name || "—",
          ownerEmail: owner?.email || "—",
          ownerPhone: owner?.phone || "—",
          status: owner?.active ? "Active" : "Inactive",
          subscriptionPlan: gym.subscription?.plan || "—",
          subscriptionStatus: gym.subscription?.status || "—",
          subscriptionEnd: gym.subscription?.endDate ? new Date(gym.subscription.endDate).toLocaleDateString("en-IN") : "—",
          memberCount,
          totalRevenue: revenue[0]?.total || 0,
          createdAt: new Date(gym.createdAt).toLocaleDateString("en-IN"),
        };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
