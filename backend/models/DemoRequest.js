const mongoose = require("mongoose");

const demoRequestSchema = new mongoose.Schema(
  {
    gymName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoRequest", demoRequestSchema);
