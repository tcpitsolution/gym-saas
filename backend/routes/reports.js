const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Member = require("../models/Member");
const Payment = require("../models/Payment");

const router = express.Router();

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeCount = await Member.countDocuments({
      gymId,
      status: "active",
    });

    const expiringSoon = await Member.countDocuments({
      gymId,
      membershipEnd: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const revenueLast30 = await Payment.aggregate([
      {
        $match: {
          gymId,
          status: "paid",
          date: { $gte: thirtyDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          penaltyTotal: { $sum: "$penaltyAmount" },
        },
      },
    ]);

    res.json({
      activeMembers: activeCount,
      expiringSoonMembers: expiringSoon,
      revenueLast30Days: revenueLast30[0]?.total || 0,
      penaltyLast30Days: revenueLast30[0]?.penaltyTotal || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
