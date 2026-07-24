const { Resend } = require("resend");

const otpStore = new Map();

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email) {
  const otp = generateOtp();

  await getResend().emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your Gym SaaS Verification Code",
    html: `<p>Your verification code is <strong>${otp}</strong>. Valid for 5 minutes.</p>`,
  });

  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
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
