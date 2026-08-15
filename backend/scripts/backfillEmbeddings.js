require("dotenv").config();
const mongoose = require("mongoose");
const Member = require("../models/Member");
const { loadModels, getFaceDescriptor } = require("../utils/faceRecognition");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await loadModels();

  const members = await Member.find({
    photo: { $exists: true, $ne: null },
    $or: [{ faceEmbedding: null }, { faceEmbedding: { $exists: false } }],
  });

  console.log(
    `Found ${members.length} members with a photo but no face embedding.\n`,
  );

  let success = 0;
  let failed = 0;

  for (const member of members) {
    try {
      const descriptor = await getFaceDescriptor(member.photo);
      if (descriptor) {
        member.faceEmbedding = descriptor;
        await member.save();
        console.log(`✅ ${member.name} — embedding generated`);
        success++;
      } else {
        console.log(`❌ ${member.name} — no face detected in stored photo`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${member.name} — error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  await mongoose.disconnect();
  process.exit(0);
}

run();
