const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const otpRoutes = require("./routes/otp");
const penaltyRoutes = require("./routes/penalty");
const messageRoutes = require("./routes/messages");
const exportRoutes = require("./routes/exports");
const { loadModels } = require("./utils/faceRecognition");
const app = express();

// middlewares
app.use(
  cors({
    origin: [
      "https://flexops.site",
      "https://www.flexops.site",
      "https://flexops-gym.netlify.app",
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:19006",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));

// health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes require
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const planRoutes = require("./routes/plans");
const memberRoutes = require("./routes/members");
const attendanceRoutes = require("./routes/attendance");
const reportRoutes = require("./routes/reports");
const paymentRoutes = require("./routes/payments");
const trainerRoutes = require("./routes/trainers");
const aiRoutes = require("./routes/ai");
const notificationsRoute = require("./routes/notifications");
const { startMembershipCron } = require("./jobs/membershipCron");

// routes mount
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/penalty", penaltyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationsRoute);

// DB connect — cron ab sirf tab start hoga jab DB connect ho chuka ho
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    startMembershipCron();
  })
  .catch((err) => console.error("DB error", err.message));

// Load face recognition models once, then start accepting requests.
loadModels()
  .then(() => {
    console.log("Face recognition models ready");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on", process.env.PORT || 5000);
    });
  })
  .catch((err) => {
    console.error("Failed to load face recognition models:", err.message);
    app.listen(process.env.PORT || 5000, () => {
      console.log(
        "Server running on",
        process.env.PORT || 5000,
        "(face models NOT loaded)",
      );
    });
  });
