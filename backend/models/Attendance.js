const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    checkInAt: { type: Date, default: Date.now },
    checkOutAt: { type: Date },
    method: {
      type: String,
      enum: ["Manual", "QR", "PIN", "App", "Face"],
      default: "Manual",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
