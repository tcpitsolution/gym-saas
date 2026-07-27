const mongoose = require("mongoose");

const adminPlanSchema = new mongoose.Schema(
  {
    key:      { type: String, required: true, unique: true }, // e.g. "1month"
    label:    { type: String, required: true },               // e.g. "1 Month Plan"
    price:    { type: Number, required: true },               // e.g. 999
    duration: { type: Number, required: true },               // days e.g. 30
    desc:     { type: String, default: "" },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminPlan", adminPlanSchema);
