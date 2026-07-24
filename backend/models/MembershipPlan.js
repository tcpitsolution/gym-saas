const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    name: { type: String, required: true },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
    allowClasses: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MembershipPlan", planSchema);
