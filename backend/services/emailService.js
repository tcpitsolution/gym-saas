const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  if (!to) return; // skip silently if member has no email on file
  try {
    await resend.emails.send({
      from: "FlexOps Gym <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`EMAIL FAILED to ${to}:`, err.message);
  }
}

function renewalReminderEmail(member, gymName) {
  return {
    subject: `Your membership at ${gymName} is expiring soon`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Hi ${member.name},</h2>
        <p>Your membership at <strong>${gymName}</strong> is set to expire on
        <strong>${member.membershipEnd.toDateString()}</strong> — that's just 7 days away.</p>
        <p>Please renew soon to keep your access uninterrupted.</p>
        <p>Thanks,<br/>${gymName}</p>
      </div>
    `,
  };
}

function expiryEmail(member, gymName) {
  return {
    subject: `Your membership at ${gymName} has expired`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Hi ${member.name},</h2>
        <p>Your membership at <strong>${gymName}</strong> expired today,
        <strong>${new Date().toDateString()}</strong>.</p>
        <p>Please renew your membership to continue enjoying access to the gym.</p>
        <p>Thanks,<br/>${gymName}</p>
      </div>
    `,
  };
}

function ownerSummaryEmail(expiredMembers, gymName) {
  const list = expiredMembers
    .map(
      (m) => `<li>${m.name} — ${m.phone}${m.email ? ` — ${m.email}` : ""}</li>`,
    )
    .join("");
  return {
    subject: `${expiredMembers.length} membership(s) expired today at ${gymName}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Membership Expiry Report</h2>
        <p>The following ${expiredMembers.length} member(s) had their membership expire today
        (${new Date().toDateString()}):</p>
        <ul>${list}</ul>
        <p>Each of them has also been notified by email.</p>
      </div>
    `,
  };
}

function newMemberWelcomeEmail(
  member,
  gymName,
  planName,
  membershipEnd,
  amount,
  mode,
  trainerId,
) {
  return {
    subject: `Welcome to ${gymName}! Your membership is confirmed 🎉`,
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:520px;background:#0E1011;color:#fff;border-radius:12px;">
        <div style="border-bottom:2px solid #FF5A36;padding-bottom:16px;margin-bottom:20px;">
          <h1 style="margin:0;font-size:22px;color:#FF5A36;">FLEX<span style="color:#fff;">OPS</span></h1>
        </div>
        <h2 style="color:#fff;margin-bottom:4px;">Welcome, ${member.name}! 💪</h2>
        <p style="color:rgba(255,255,255,0.6);margin-top:0;">You are now an official member of <strong style="color:#fff;">${gymName}</strong>.</p>

        <div style="background:#16191B;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);">Membership Details</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Plan</td><td style="padding:8px 0;color:#fff;font-weight:600;font-size:14px;">${planName}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Start Date</td><td style="padding:8px 0;color:#fff;font-size:14px;">${new Date(member.membershipStart).toDateString()}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Valid Until</td><td style="padding:8px 0;color:#2DD4C4;font-weight:700;font-size:14px;">${new Date(membershipEnd).toDateString()}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Amount Paid</td><td style="padding:8px 0;color:#FF5A36;font-weight:700;font-size:14px;">₹${amount}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Payment Mode</td><td style="padding:8px 0;color:#fff;font-size:14px;text-transform:capitalize;">${mode || "—"}</td></tr>
            ${member.phone ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Phone</td><td style="padding:8px 0;color:#fff;font-size:14px;">${member.phone}</td></tr>` : ""}
            ${member.goal ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:14px;">Goal</td><td style="padding:8px 0;color:#fff;font-size:14px;">${member.goal}</td></tr>` : ""}
          </table>
        </div>

        <p style="color:rgba(255,255,255,0.6);font-size:14px;">Stay consistent and crush your goals! If you have any questions, contact your gym directly.</p>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;">— <strong style="color:#FF5A36;">${gymName}</strong> powered by FlexOps</p>
      </div>
    `,
  };
}

function newTrainerWelcomeEmail(trainer, gymName, password) {
  return {
    subject: `You've been added as a Trainer at ${gymName}`,
    html: `
      <div style="font-family:sans-serif;padding:20px;max-width:500px;">
        <h2>Welcome, ${trainer.name}! 🏋️</h2>
        <p>You have been added as a <strong>Trainer</strong> at <strong>${gymName}</strong>.</p>
        <p>Here are your login credentials:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;color:#888;">Email</td><td style="padding:8px;"><strong>${trainer.email}</strong></td></tr>
          <tr><td style="padding:8px;color:#888;">Password</td><td style="padding:8px;"><strong>${password}</strong></td></tr>
        </table>
        <p>Please login and change your password after first login.</p>
        <p>Thanks,<br/><strong>${gymName}</strong></p>
      </div>
    `,
  };
}

function newGymOwnerWelcomeEmail(ownerName, gymName, email, password) {
  return {
    subject: `Your FlexOps account is ready — ${gymName}`,
    html: `
      <div style="font-family:sans-serif;padding:20px;max-width:500px;">
        <h2>Welcome, ${ownerName}! 🎊</h2>
        <p>Your gym <strong>${gymName}</strong> has been set up on <strong>FlexOps</strong>.</p>
        <p>Here are your login credentials:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;color:#888;">Email</td><td style="padding:8px;"><strong>${email}</strong></td></tr>
          <tr><td style="padding:8px;color:#888;">Password</td><td style="padding:8px;"><strong>${password}</strong></td></tr>
        </table>
        <p>Login at <a href="https://flexops.in/login">flexops.in/login</a> to manage your gym.</p>
        <p>Thanks,<br/><strong>FlexOps Team</strong></p>
      </div>
    `,
  };
}

function demoRequestUserEmail(ownerName, gymName) {
  return {
    subject: "Thanks for your interest in FlexOps!",
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:500px;background:#0E1011;color:#fff;border-radius:12px;">
        <div style="border-bottom:2px solid #FF5A36;padding-bottom:16px;margin-bottom:20px;">
          <h1 style="margin:0;font-size:22px;color:#FF5A36;">FLEX<span style="color:#fff;">OPS</span></h1>
        </div>
        <h2 style="color:#fff;margin-bottom:6px;">Hi ${ownerName},</h2>
        <p style="color:rgba(255,255,255,0.65);margin-top:0;">Thank you for your interest in <strong style="color:#fff;">FlexOps</strong>!</p>
        <p style="color:rgba(255,255,255,0.65);">We have received your demo request for <strong style="color:#fff;">${gymName}</strong>. Our team will get in touch with you shortly to set up your gym account.</p>
        <div style="background:#16191B;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;">What happens next?</p>
          <ul style="color:rgba(255,255,255,0.65);font-size:14px;margin:10px 0 0;padding-left:18px;line-height:1.8;">
            <li>Our team will review your request</li>
            <li>We will contact you within 24 hours</li>
            <li>Your gym account will be set up and credentials sent to you</li>
          </ul>
        </div>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;">— <strong style="color:#FF5A36;">FlexOps Team</strong></p>
      </div>
    `,
  };
}

function demoRequestAdminEmail(ownerName, gymName, email, phone, message) {
  return {
    subject: `New Demo Request — ${gymName}`,
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:500px;">
        <h2 style="color:#FF5A36;">New Demo Request Received</h2>
        <p>A new gym owner has submitted a demo request on FlexOps.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Gym Name</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${gymName}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Owner Name</td><td style="padding:8px 0;font-size:14px;">${ownerName}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Phone</td><td style="padding:8px 0;font-size:14px;">${phone || "—"}</td></tr>
          ${message ? `<tr><td style="padding:8px 0;color:#888;font-size:14px;">Message</td><td style="padding:8px 0;font-size:14px;">${message}</td></tr>` : ""}
        </table>
        <p style="color:#888;font-size:13px;">Login to the admin panel to review and approve this request.</p>
      </div>
    `,
  };
}

module.exports = {
  sendEmail,
  renewalReminderEmail,
  expiryEmail,
  ownerSummaryEmail,
  newMemberWelcomeEmail,
  newTrainerWelcomeEmail,
  newGymOwnerWelcomeEmail,
  demoRequestUserEmail,
  demoRequestAdminEmail,
};
