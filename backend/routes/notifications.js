const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Member = require("../models/Member");

const router = express.Router();

router.get("/expiry-summary", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiredToday = await Member.countDocuments({
      gymId,
      membershipEnd: { $gte: start, $lte: end },
    });

    const expiringSoon = await Member.countDocuments({
      gymId,
      membershipEnd: { $gte: end, $lte: sevenDaysFromNow },
      status: "active",
    });

    res.json({ expiredToday, expiringSoon });
  } catch (err) {
    console.error("EXPIRY SUMMARY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
