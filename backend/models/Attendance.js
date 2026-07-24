const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    checkInTime: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
