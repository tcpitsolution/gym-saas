const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: {
      type: String,
      enum: ["cash", "upi", "card", "online"],
      default: "cash",
    },
    status: { type: String, enum: ["paid", "pending"], default: "paid" },
    penaltyAmount: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
