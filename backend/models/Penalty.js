const mongoose = require("mongoose");

const penaltySchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: { type: Number, required: true },
    reason: { type: String, default: "Late payment" },
    daysLate: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Penalty", penaltySchema);
