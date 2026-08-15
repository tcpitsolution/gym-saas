const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");
const {
  getFaceDescriptor,
  euclideanDistance,
} = require("../utils/faceRecognition");

const router = express.Router();

// Similarity threshold — higher = stricter match. 0.6 is a commonly used
// starting point for face-api.js descriptors; tune after real testing.
// Euclidean distance threshold — LOWER distance means MORE similar.
// 0.5 is stricter (fewer false matches), 0.6 is looser. Start at 0.5.
const MATCH_THRESHOLD = 0.42;

// ---------- Face-scan route (accepts base64 image from app) ----------
// Called by the app's attendance screen. Detects the face in the live photo,
// generates its descriptor, and compares it against every enrolled member's
// stored descriptor using cosine similarity — all locally, no external API.
router.post("/face-scan", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { image } = req.body;

    if (!image) return res.status(400).json({ error: "Image required" });

    // 1. Detect + describe the face in the live camera photo
    const liveDescriptor = await getFaceDescriptor(image);

    if (!liveDescriptor) {
      console.log("[face-scan] no face detected in live photo");
      return res
        .status(200)
        .json({ matched: false, reason: "no_face_detected" });
    }

    // 2. Fetch all enrolled members (must have a stored faceEmbedding)
    const members = await Member.find({
      gymId,
      faceEmbedding: { $exists: true, $ne: null },
    }).lean();
    console.log(`[face-scan] members with embedding: ${members.length}`);

    if (!members.length) {
      return res
        .status(200)
        .json({ matched: false, reason: "no_enrolled_members" });
    }

    // 3. Find best match
    // 3. Find best AND second-best match — lowest distance wins.
    // Tracking the second-best lets us reject ambiguous matches: if the
    // top two candidates are nearly equally close, the model isn't
    // confident enough to say which one it really is.
    let bestMatch = null;
    let bestDistance = Infinity;
    let secondBestDistance = Infinity;
    for (const member of members) {
      const distance = euclideanDistance(liveDescriptor, member.faceEmbedding);
      if (distance < bestDistance) {
        secondBestDistance = bestDistance;
        bestDistance = distance;
        bestMatch = member;
      } else if (distance < secondBestDistance) {
        secondBestDistance = distance;
      }
    }

    // Minimum gap required between best and second-best match. If the two
    // closest members are this close to each other, the scan is treated as
    // unreliable and rejected rather than guessing.
    const MIN_CONFIDENCE_MARGIN = 0.08;
    const isAmbiguous =
      members.length > 1 &&
      secondBestDistance - bestDistance < MIN_CONFIDENCE_MARGIN;

    if (!bestMatch || bestDistance > MATCH_THRESHOLD || isAmbiguous) {
      return res.status(200).json({
        matched: false,
        reason: isAmbiguous ? "ambiguous_match" : "below_threshold",
        closestDistance: Number(bestDistance.toFixed(3)),
        closestMemberName: bestMatch?.name || null,
      });
    }
    // 4. Already checked in today?
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
      });
    }

    await Attendance.create({
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
    });
  } catch (err) {
    console.error("[face-scan] error:", err.message, err.stack);
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
