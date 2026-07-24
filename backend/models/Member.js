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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Member", memberSchema);
