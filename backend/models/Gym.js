const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gym", gymSchema);
