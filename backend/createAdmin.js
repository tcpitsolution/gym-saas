const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const Gym = require("./models/Gym");
const User = require("./models/User");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  let gym = await Gym.findOne({ name: "Admin Gym" });
  if (!gym) gym = await Gym.create({ name: "Admin Gym" });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    gymId: gym._id,
    name: "Admin",
    email,
    password: hashed,
    role: "owner",
    active: true,
    otpVerifiedAt: new Date(), // skip OTP on first login
  });

  console.log("Admin created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  process.exit(0);
}

createAdmin().catch((err) => { console.error(err); process.exit(1); });
