const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------- Face-scan route (accepts base64 image from app) ----------
router.post("/face-scan", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { image } = req.body;

    if (!image) return res.status(400).json({ error: "Image required" });

    const scannedBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    const members = await Member.find({ gymId, photo: { $ne: null }, status: "active" }).lean();
    console.log(`[face-scan] members with photo: ${members.length}`);

    if (!members.length) {
      return res.status(200).json({ matched: false });
    }

    const BATCH_SIZE = 5;
    let matchedMember = null;

    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE);

      const parts = [
        {
          text: `You are a face recognition system for gym attendance. Compare the live camera photo with each registered member photo.

RULES:
- Focus on facial features: face shape, eyes, nose, mouth, jawline
- Ignore: lighting differences, image quality, angle, background, clothing
- Be lenient with partial matches — if you are 60% or more confident it is the same person, consider it a match
- Return the _id of the BEST matching member if confidence >= 60%, otherwise return null

Return ONLY valid JSON, no markdown, no explanation:
{ "matchedId": "<exact _id string or null>" }`,
        },
        { inlineData: { mimeType: "image/jpeg", data: scannedBase64 } },
        { text: "Above is the live camera photo. Below are the registered members:" },
      ];

      for (const member of batch) {
        const memberBase64 = member.photo.replace(/^data:image\/\w+;base64,/, "");
        parts.push({ text: `Member _id: ${String(member._id)} | Name: ${member.name}` });
        parts.push({ inlineData: { mimeType: "image/jpeg", data: memberBase64 } });
      }

      let result;
      try {
        result = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{ role: "user", parts }],
        });
      } catch (geminiErr) {
        console.error("[face-scan] Gemini API error:", geminiErr.message);
        continue;
      }

      const raw = (result.text || "").trim();
      console.log(`[face-scan] Gemini raw response:`, raw);

      let matchedId = null;
      try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const json = JSON.parse(cleaned);
        matchedId = json.matchedId;
      } catch (parseErr) {
        console.error("[face-scan] JSON parse error:", parseErr.message, "raw:", raw);
        continue;
      }

      console.log(`[face-scan] matchedId from Gemini:`, matchedId);

      if (matchedId && matchedId !== "null" && matchedId !== null) {
        matchedMember = batch.find((m) => String(m._id) === String(matchedId));
        if (matchedMember) {
          console.log(`[face-scan] matched member: ${matchedMember.name}`);
          break;
        }
      }
    }

    if (!matchedMember) {
      console.log(`[face-scan] no match found`);
      return res.status(200).json({ matched: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({
      gymId,
      memberId: matchedMember._id,
      checkInAt: { $gte: today },
    });

    if (existing) {
      return res.status(200).json({
        matched: true,
        alreadyCheckedIn: true,
        member: { _id: matchedMember._id, name: matchedMember.name, photo: matchedMember.photo },
      });
    }

    await Attendance.create({
      gymId,
      memberId: matchedMember._id,
      checkInAt: new Date(),
      method: "Face",
    });

    res.status(201).json({
      matched: true,
      alreadyCheckedIn: false,
      member: { _id: matchedMember._id, name: matchedMember.name, photo: matchedMember.photo },
    });
  } catch (err) {
    console.error("[face-scan] error:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Cosine similarity helper (for legacy /face-checkin) ----------
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Similarity threshold — higher = stricter match. Tune this after real testing.
const MATCH_THRESHOLD = 0.75;

// ---------- Face-based check-in ----------
router.post("/face-checkin", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ error: "Face embedding required" });
    }

    // Fetch all members of this gym who have a face embedding saved
    const members = await Member.find({ gymId, faceEmbedding: { $ne: null } });

    let bestMatch = null;
    let bestScore = -1;

    for (const member of members) {
      const score = cosineSimilarity(embedding, member.faceEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = member;
      }
    }

    // No match found — face not recognized
    if (!bestMatch || bestScore < MATCH_THRESHOLD) {
      return res.status(404).json({
        matched: false,
        message: "This user is not in member list",
      });
    }

    // Match found — check membership status
    if (bestMatch.status !== "active") {
      return res.status(400).json({
        matched: true,
        member: {
          _id: bestMatch._id,
          name: bestMatch.name,
          photo: bestMatch.photo,
        },
        error: "Membership inactive/expired",
      });
    }

    // Already checked in today?
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({
      gymId,
      memberId: bestMatch._id,
      checkInAt: { $gte: today },
    });

    if (existing) {
      return res.status(200).json({
        matched: true,
        alreadyCheckedIn: true,
        member: {
          _id: bestMatch._id,
          name: bestMatch.name,
          photo: bestMatch.photo,
        },
        message: "Attendance already done today",
      });
    }

    const record = await Attendance.create({
      gymId,
      memberId: bestMatch._id,
      checkInAt: new Date(),
      method: "Face",
    });

    res.status(201).json({
      matched: true,
      alreadyCheckedIn: false,
      member: {
        _id: bestMatch._id,
        name: bestMatch.name,
        photo: bestMatch.photo,
      },
      attendance: record,
      message: "Attendance done today",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-in (manual/web)
router.post("/checkin", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { memberId, method, notes } = req.body;

    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.status !== "active")
      return res.status(400).json({ error: "Membership inactive/expired" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({
      gymId,
      memberId,
      checkInAt: { $gte: today },
    });
    if (existing)
      return res.status(400).json({ error: "Already checked in today" });

    const record = await Attendance.create({
      gymId,
      memberId,
      checkInAt: new Date(),
      method: method || "Manual",
      notes,
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-out
router.post("/checkout/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const record = await Attendance.findOne({
      _id: req.params.id,
      gymId,
      checkOutAt: null,
    });
    if (!record)
      return res.status(404).json({ error: "Active check-in not found" });

    record.checkOutAt = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Today's attendance log
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await Attendance.find({ gymId, checkInAt: { $gte: today } })
      .populate("memberId", "name phone")
      .sort({ checkInAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCheckIns, activeNow] = await Promise.all([
      Attendance.countDocuments({ gymId, checkInAt: { $gte: today } }),
      Attendance.countDocuments({
        gymId,
        checkInAt: { $gte: today },
        checkOutAt: null,
      }),
    ]);

    const blockedMembers = await Member.countDocuments({
      gymId,
      status: { $in: ["expired", "inactive"] },
    });

    res.json({ todayCheckIns, activeNow, blocked: blockedMembers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Member attendance history
router.get("/member/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const logs = await Attendance.find({ gymId, memberId: req.params.id })
      .sort({ checkInAt: -1 })
      .limit(30);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
