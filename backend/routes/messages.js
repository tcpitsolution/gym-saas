const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { sendMessage } = require("../services/messageService");
const Message = require("../models/Message");
const Member = require("../models/Member");

const router = express.Router();

router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId, subject, content, type } = req.body;

    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (!member.email)
      return res.status(400).json({ error: "Member has no email on file" });

    const message = await sendMessage({
      gymId,
      memberId,
      email: member.email,
      subject,
      content,
      type,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId } = req.query;

    const query = { gymId };
    if (memberId) query.memberId = memberId;

    const messages = await Message.find(query).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;