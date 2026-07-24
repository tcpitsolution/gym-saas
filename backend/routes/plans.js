const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const MembershipPlan = require("../models/MembershipPlan");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { gymId, role } = req.user;
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Not allowed" });
    }

    const { name, durationDays, price, allowClasses = true } = req.body;

    const plan = await MembershipPlan.create({
      gymId,
      name,
      durationDays,
      price,
      allowClasses,
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const plans = await MembershipPlan.find({ gymId }).sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
