const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const Payment = require("../models/Payment");
const Gym = require("../models/Gym");
const {
  sendEmail,
  newMemberWelcomeEmail,
} = require("../services/emailService");
const { sendOtp } = require("../services/otpService");
const { getFaceDescriptor } = require("../utils/faceRecognition");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const {
      name,
      phone,
      email,
      planId,
      startDate,
      amount,
      mode,
      goal,
      emergencyContact,
      trainerId,
      joinSource,
      notes,
      agreeTerms,
      photo,
      faceEmbedding,
    } = req.body;

    const plan = await MembershipPlan.findOne({ _id: planId, gymId });
    if (!plan) return res.status(400).json({ error: "Plan not found" });

    const start = new Date(startDate || Date.now());
    const end = new Date(
      start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    // Agar photo hai lekin faceEmbedding nahi diya toh auto-generate karo
    let resolvedEmbedding = faceEmbedding;
    let faceEnrollWarning = null;
    if (photo && !faceEmbedding) {
      try {
        resolvedEmbedding = await getFaceDescriptor(photo);
        if (!resolvedEmbedding) {
          faceEnrollWarning =
            "No face detected in the photo — face attendance won't work for this member until re-enrolled.";
        }
      } catch (_) {
        faceEnrollWarning =
          "Face processing failed — face attendance won't work for this member until re-enrolled.";
      }
    }

    const member = await Member.create({
      gymId,
      name,
      phone,
      email,
      photo,
      faceEmbedding: resolvedEmbedding,
      currentPlan: plan._id,
      membershipStart: start,
      membershipEnd: end,
      status: "active",
      goal,
      emergencyContact,
      trainerId: trainerId || null,
      joinSource,
      notes,
      agreeTerms,
    });

    await Payment.create({
      gymId,
      memberId: member._id,
      planId: plan._id,
      amount: Number(amount) || 0,
      mode,
      status: "paid",
    });

    if (member.email) {
      const gym = await Gym.findById(gymId);
      const { subject, html } = newMemberWelcomeEmail(
        member,
        gym?.name || "Your Gym",
        plan.name,
        end,
        amount,
        mode,
      );
      sendEmail(member.email, subject, html);
    }

    res.status(201).json({ ...member.toObject(), faceEnrollWarning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { status, search } = req.query;

    const query = { gymId };
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const members = await Member.find(query)
      .populate("currentPlan", "name price")
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const member = await Member.findOne({ _id: req.params.id, gymId });
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const allowedFields = [
      "name",
      "phone",
      "email",
      "photo",
      "faceEmbedding",
      "goal",
      "emergencyContact",
      "trainerId",
      "joinSource",
      "notes",
      "gender",
      "dob",
      "address",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Agar photo update ho rahi hai aur faceEmbedding explicitly nahi diya,
    // toh photo se automatically embedding generate karo
    if (req.body.photo && req.body.faceEmbedding === undefined) {
      try {
        const descriptor = await getFaceDescriptor(req.body.photo);
        if (descriptor) updates.faceEmbedding = descriptor;
      } catch (_) {
        // face detection fail ho toh silently skip karo, photo toh save hogi
      }
    }

    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId },
      { $set: updates },
      { new: true },
    );
    if (!member) return res.status(404).json({ error: "Member not found" });

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/enroll-face", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { image } = req.body;

    if (!image) return res.status(400).json({ error: "Image required" });

    // Generate the face embedding (128-number descriptor) from the photo.
    // This is what /api/attendance/face-scan will later compare against.
    const descriptor = await getFaceDescriptor(image);

    if (!descriptor) {
      // No face could be detected in the enrollment photo — surfacing this
      // clearly is important, otherwise the member will silently never be
      // matchable during attendance scans later.
      return res.status(200).json({
        success: false,
        error:
          "No face detected in the photo — please retake with better lighting, facing the camera directly.",
      });
    }

    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gymId },
      { $set: { photo: image, faceEmbedding: descriptor } },
      { new: true },
    );
    if (!member) return res.status(404).json({ error: "Member not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("[enroll-face] error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { gymId, role } = req.user;
    if (role !== "owner" && role !== "manager")
      return res.status(403).json({ error: "Not allowed" });

    const member = await Member.findOneAndDelete({ _id: req.params.id, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });

    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/renew", authMiddleware, async (req, res) => {
  try {
    const { gymId } = req.user;
    const { planId, startDate, amount, penaltyAmount = 0, mode } = req.body;

    const member = await Member.findOne({ _id: req.params.id, gymId });
    if (!member) return res.status(404).json({ error: "Member not found" });

    const plan = await MembershipPlan.findOne({ _id: planId, gymId });
    if (!plan) return res.status(400).json({ error: "Plan not found" });

    const start = new Date(startDate || Date.now());
    const end = new Date(
      start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    member.currentPlan = plan._id;
    member.membershipStart = start;
    member.membershipEnd = end;
    member.status = "active";
    await member.save();

    await Payment.create({
      gymId,
      memberId: member._id,
      planId: plan._id,
      amount,
      penaltyAmount,
      mode,
      status: "paid",
    });

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
