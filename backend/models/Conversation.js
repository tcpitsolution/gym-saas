const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
    title: { type: String, default: "New Chat" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);