const cron = require("node-cron");
const Member = require("../models/Member");
const Gym = require("../models/Gym");
const {
  sendEmail,
  renewalReminderEmail,
  expiryEmail,
  ownerSummaryEmail,
} = require("../services/emailService");
const User = require("../models/User");

// Returns the start and end of "today" so we can match on membershipEnd date only
function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function daysFromNowRange(days) {
  const start = new Date();
  start.setDate(start.getDate() + days);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function runMembershipCheck() {
  console.log("Running membership expiry check:", new Date().toISOString());

  // ---- 1. 7-day-before reminders ----
  const sevenDayRange = daysFromNowRange(7);
  const expiringSoon = await Member.find({
    membershipEnd: { $gte: sevenDayRange.start, $lte: sevenDayRange.end },
    renewalReminderSentAt: null,
    status: "active",
  });

  for (const member of expiringSoon) {
    const gym = await Gym.findById(member.gymId);
    const gymName = gym?.name || "your gym";
    const { subject, html } = renewalReminderEmail(member, gymName);
    await sendEmail(member.email, subject, html);
    member.renewalReminderSentAt = new Date();
    await member.save();
  }

  // ---- 2. Expiry-day notifications (grouped per gym for owner summary) ----
  const { start, end } = todayRange();
  const expiredToday = await Member.find({
    membershipEnd: { $gte: start, $lte: end },
    expiryNotifiedAt: null,
  });

  const byGym = {};
  for (const member of expiredToday) {
    const key = member.gymId.toString();
    if (!byGym[key]) byGym[key] = [];
    byGym[key].push(member);

    // mark expired + notify member
    member.status = "expired";
    member.expiryNotifiedAt = new Date();
    await member.save();
  }

  for (const gymId of Object.keys(byGym)) {
    const gym = await Gym.findById(gymId);
    const gymName = gym?.name || "your gym";
    const members = byGym[gymId];

    // email each member
    for (const member of members) {
      const { subject, html } = expiryEmail(member, gymName);
      await sendEmail(member.email, subject, html);
    }

    // email the owner a summary
    const owner = await User.findOne({ gymId, role: "owner" });
    if (owner?.email) {
      const { subject, html } = ownerSummaryEmail(members, gymName);
      await sendEmail(owner.email, subject, html);
    }
  }

  console.log(
    `Membership check done. Reminders sent: ${expiringSoon.length}, Expired today: ${expiredToday.length}`,
  );
}

// Runs once every day at 9:00 AM server time
function startMembershipCron() {
  cron.schedule("0 9 * * *", runMembershipCheck);
  console.log("Membership expiry cron scheduled (daily 9:00 AM)");
}

module.exports = { startMembershipCron, runMembershipCheck };
