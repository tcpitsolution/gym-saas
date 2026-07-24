const { Resend } = require("resend");
const Message = require("../models/Message");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMessage({
  gymId,
  memberId,
  email,
  subject,
  content,
  type = "custom",
}) {
  let status = "sent";

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: subject || "Message from your Gym",
      html: `<p>${content}</p>`,
    });
  } catch (err) {
    console.error("Message send error:", err.message);
    status = "failed";
  }

  const message = await Message.create({
    gymId,
    memberId,
    type,
    subject,
    content,
    status,
    sentAt: status === "sent" ? new Date() : null,
  });

  return message;
}

module.exports = { sendMessage };
