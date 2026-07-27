const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    gender: String,
    dob: Date,
    address: String,
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
    },
    membershipStart: Date,
    membershipEnd: Date,
    status: {
      type: String,
      enum: ["active", "expired", "paused"],
      default: "active",
    },
    goal: { type: String },
    emergencyContact: { type: String },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinSource: { type: String },
    notes: { type: String },
    agreeTerms: { type: Boolean, default: false },

    // NEW: tracking fields so we never send the same notification twice
    renewalReminderSentAt: { type: Date, default: null },
    expiryNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

memberSchema.index({ gymId: 1 });
memberSchema.index({ membershipEnd: 1 });

module.exports = mongoose.model("Member", memberSchema);
