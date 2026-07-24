const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    type: {
      type: String,
      enum: ["reminder", "offer", "welcome", "custom"],
      default: "custom",
    },
    subject: String,
    content: { type: String, required: true },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
    sentAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
