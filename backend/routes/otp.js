const express = require("express");
const { sendOtp, verifyOtp } = require("../services/otpService");

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    await sendOtp(email);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", (req, res) => {
  const { email, otp } = req.body;
  const result = verifyOtp(email, otp);
  res.json(result);
});

module.exports = router;
