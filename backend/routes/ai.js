const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { askAI } = require("../services/aiService");
const Member = require("../models/Member");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const Penalty = require("../models/Penalty");
const MembershipPlan = require("../models/MembershipPlan");
const Conversation = require("../models/Conversation"); // NEW

const router = express.Router();

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { message, conversationId } = req.body; // NEW: conversationId

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ---- Members ----
    const activeCount = await Member.countDocuments({
      gymId,
      status: "active",
    });
    const expiredCount = await Member.countDocuments({
      gymId,
      status: "expired",
    });

    const expiringSoon = await Member.find({
      gymId,
      membershipEnd: { $gte: now, $lte: sevenDaysFromNow },
    }).select("name phone membershipEnd");

    // ---- Revenue (30 days) ----
    const revenueAgg = await Payment.aggregate([
      {
        $match: {
          gymId,
          status: "paid",
          date: { $gte: thirtyDaysAgo, $lte: now },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    // ---- Pending payments ----
    const pendingPayments = await Payment.find({ gymId, status: "pending" })
      .populate("memberId", "name phone")
      .select("memberId amount");

    // ---- Overdue penalties ----
    const overduePenalties = await Penalty.find({ gymId, status: "pending" })
      .populate("memberId", "name phone")
      .select("memberId amount reason");

    // ---- Attendance (7 days) ----
    const attendanceCount = await Attendance.countDocuments({
      gymId,
      checkInTime: { $gte: sevenDaysAgo },
    });

    const recentAttendance = await Attendance.aggregate([
      { $match: { gymId, checkInTime: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$memberId" } },
    ]);
    const visitedIds = new Set(recentAttendance.map((a) => a._id.toString()));
    const activeMembersList = await Member.find({
      gymId,
      status: "active",
    }).select("name phone");
    const noVisitMembers = activeMembersList.filter(
      (m) => !visitedIds.has(m._id.toString()),
    );

    // ---- Plans ----
    const plans = await MembershipPlan.find({ gymId }).select(
      "name durationDays price",
    );

    // ---- Build context ----
    const context = `
GYM OVERVIEW:
- Active members: ${activeCount}
- Expired members: ${expiredCount}
- Today's date: ${now.toDateString()}

MEMBERSHIP PLANS:
${plans.length > 0 ? plans.map((p) => `- ${p.name}: ₹${p.price} for ${p.durationDays} days`).join("\n") : "None"}

MEMBERSHIP EXPIRING (next 7 days):
${expiringSoon.length > 0 ? expiringSoon.map((m) => `- ${m.name} (${m.phone}), ends ${m.membershipEnd.toDateString()}`).join("\n") : "None"}

REVENUE (last 30 days):
- Total collected: ₹${revenueAgg[0]?.total || 0}
- Number of transactions: ${revenueAgg[0]?.count || 0}

PENDING PAYMENTS:
${pendingPayments.length > 0 ? pendingPayments.map((p) => `- ${p.memberId?.name || "Unknown"} (${p.memberId?.phone || "-"}), amount due ₹${p.amount}`).join("\n") : "None"}

OVERDUE PENALTIES:
${overduePenalties.length > 0 ? overduePenalties.map((p) => `- ${p.memberId?.name || "Unknown"} (${p.memberId?.phone || "-"}), ₹${p.amount} (${p.reason})`).join("\n") : "None"}

ATTENDANCE (last 7 days):
- Total check-ins: ${attendanceCount}
- Active members with NO visit in last 7 days: ${noVisitMembers.length > 0 ? noVisitMembers.map((m) => `${m.name} (${m.phone})`).join(", ") : "None"}
    `.trim();

    const answer = await askAI(message, context);

    // ---- NEW: Save to conversation history ----
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, gymId });
    }
    if (!conversation) {
      conversation = new Conversation({
        gymId,
        title: message.slice(0, 40),
      });
    }
    conversation.messages.push({ role: "user", text: message });
    conversation.messages.push({ role: "ai", text: answer });
    await conversation.save();

    res.json({ answer, conversationId: conversation._id }); // NEW: return conversationId
  } catch (err) {
    console.error("AI CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- NEW: List all conversations (for sidebar) ----
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const conversations = await Conversation.find({ gymId })
      .select("title updatedAt")
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    console.error("LIST CONVERSATIONS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- NEW: Get one conversation's full messages ----
router.get("/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      gymId,
    });
    if (!conversation) return res.status(404).json({ error: "Not found" });
    res.json(conversation);
  } catch (err) {
    console.error("GET CONVERSATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- NEW: Delete a conversation ----
router.delete("/conversations/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    await Conversation.deleteOne({ _id: req.params.id, gymId });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE CONVERSATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
