const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "manager", "trainer", "staff"],
      default: "staff",
    },
    active: { type: Boolean, default: true },
    phone: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },
    address: { type: String, default: "" },
    aadharNumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    joiningDate: { type: Date },
    otpVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
