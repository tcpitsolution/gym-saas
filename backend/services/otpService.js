const { sendEmail } = require("./emailService");
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email) {
  const otp = generateOtp();

  await sendEmail(
    email,
    "Your FlexOps Login Verification Code",
    `<div style="font-family:sans-serif;padding:20px;">
      <h2>FlexOps Login OTP</h2>
      <p>Your verification code is <strong style="font-size:1.5rem;letter-spacing:4px">${otp}</strong></p>
      <p>Valid for <strong>5 minutes</strong>. Do not share this code.</p>
      <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
    </div>`
  );

  otpStore.set(email, { otp, expiresAt: Date.now() + 2 * 60 * 1000 });
  return { success: true };
}

function verifyOtp(email, enteredOtp) {
  const record = otpStore.get(email);
  if (!record)
    return { success: false, message: "OTP not found, request again" };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: "OTP expired" };
  }
  if (record.otp !== enteredOtp)
    return { success: false, message: "Invalid OTP" };

  otpStore.delete(email);
  return { success: true, message: "OTP verified" };
}

module.exports = { sendOtp, verifyOtp };
