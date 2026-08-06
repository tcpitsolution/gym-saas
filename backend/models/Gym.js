const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
    subscription: {
      plan: { type: String, enum: ["1month", "3month", "1year"], default: "1month" },
      status: { type: String, enum: ["active", "pending", "expired"], default: "pending" },
      startDate: { type: Date },
      endDate: { type: Date },
      amount: { type: Number, default: 0 },
    },
    features: {
      members:   { type: Boolean, default: true },
      payments:  { type: Boolean, default: true },
      trainers:  { type: Boolean, default: true },
      exercises: { type: Boolean, default: true },
      askai:     { type: Boolean, default: true },
      reports:   { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gym", gymSchema);
