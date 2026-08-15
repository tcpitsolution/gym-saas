// utils/faceRecognition.js
//
// Face detection + descriptor (embedding) generation using face-api.js,
// running fully on your own Node server — no external API, no quota, no cost.
//
// SETUP:
// 1. npm install face-api.js @tensorflow/tfjs-node canvas
// 2. Unzip the provided face-api-models.zip so you have a folder like:
//    <project-root>/models/tiny_face_detector_model-shard1
//    <project-root>/models/tiny_face_detector_model-weights_manifest.json
//    <project-root>/models/face_landmark_68_model-shard1
//    <project-root>/models/face_landmark_68_model-weights_manifest.json
//    <project-root>/models/face_recognition_model-shard1
//    <project-root>/models/face_recognition_model-shard2
//    <project-root>/models/face_recognition_model-weights_manifest.json
// 3. Call `loadModels()` ONCE when your server starts (see server.js snippet below).
// 4. Use `getFaceDescriptor(base64Image)` wherever you need to turn a photo into
//    a 128-length embedding array — both at member-enrollment time and at
//    attendance-scan time.
//
// MATCHING: face-api.js descriptors are meant to be compared with EUCLIDEAN
// DISTANCE (lower = more similar), not cosine similarity. Cosine similarity
// scores stay high (often 0.6+) even for different people because the
// embeddings live in a narrow cone of the vector space — using it as the
// match metric causes false positives (wrong member matched). Use
// `euclideanDistance()` below for matching; a distance under ~0.5-0.6 is
// considered a match.

const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = path.join(__dirname, "..", "models", "faceModels"); // adjust if your folder is elsewhere

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  modelsLoaded = true;
  console.log("[faceRecognition] models loaded from", MODELS_PATH);
}

/**
 * Takes a base64 image (with or without the data:image/...;base64, prefix)
 * and returns a 128-length face descriptor array, or null if no face found.
 */
async function getFaceDescriptor(base64Image) {
  if (!modelsLoaded) {
    throw new Error(
      "Face models not loaded yet — call loadModels() at server startup",
    );
  }

  const cleaned = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(cleaned, "base64");
  const img = await canvas.loadImage(buffer);

  // Resize to max 320px for speed
  const MAX = 320;
  const scale = Math.min(MAX / img.width, MAX / img.height, 1);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const cvs = canvas.createCanvas(w, h);
  cvs.getContext("2d").drawImage(img, 0, 0, w, h);

  const detection = await faceapi
    .detectSingleFace(
      cvs,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.4,
      }),
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return Array.from(detection.descriptor);
}

/**
 * Euclidean distance between two descriptors — THIS is the correct metric
 * for face-api.js face matching. Lower distance = more similar faces.
 * Typical usable threshold: 0.5 (strict) to 0.6 (looser).
 */
function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Cosine similarity — kept for reference/backwards compatibility, but do
 * NOT use this for deciding face matches (see note above the imports).
 * Higher = more similar, range roughly -1 to 1.
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  loadModels,
  getFaceDescriptor,
  cosineSimilarity,
  euclideanDistance,
};
