const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const otpRoutes = require("./routes/otp");
const penaltyRoutes = require("./routes/penalty");
const messageRoutes = require("./routes/messages");
const exportRoutes = require("./routes/exports");
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB error", err.message));

// health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes require
const authRoutes = require("./routes/auth");
const planRoutes = require("./routes/plans");
const memberRoutes = require("./routes/members");
const attendanceRoutes = require("./routes/attendance");
const reportRoutes = require("./routes/reports");

// routes mount
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/penalty", penaltyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/exports", exportRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on", process.env.PORT || 5000);
});
