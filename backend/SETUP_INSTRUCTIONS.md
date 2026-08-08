# Face Recognition Fix — Setup Instructions (face-api.js)

This replaces the unreliable Gemini-vision-based face scan with real face
embeddings + cosine similarity, running entirely on your own server. No API
key, no quota, no per-request cost, no rate limit.

## 1. Install dependencies

```bash
npm install face-api.js @tensorflow/tfjs-node canvas
```

`canvas` has native bindings but ships prebuilt binaries for common
platforms (Linux x64, which is what Render/Railway/most hosts use), so this
usually installs without a long compile step. If your host's build fails on
`canvas`, check their docs for "node-canvas" system dependencies
(`libcairo2-dev`, `libpango1.0-dev`, `libjpeg-dev`, `libgif-dev` — most
managed Node hosts already include these).

## 2. Add the model files

Unzip `face-api-models.zip` (provided) at your **project root**, so you get:

```
your-backend/
  models/
    tiny_face_detector_model-shard1
    tiny_face_detector_model-weights_manifest.json
    face_landmark_68_model-shard1
    face_landmark_68_model-weights_manifest.json
    face_recognition_model-shard1
    face_recognition_model-shard2
    face_recognition_model-weights_manifest.json
  routes/
    attendance.js
    members.js
  utils/
    faceRecognition.js   <-- new file, provided
  ...
```

Commit this `models/` folder to your repo (it's only ~5MB) so it deploys
along with your code — no runtime download needed.

If your `utils/` folder is at a different depth than `routes/`, adjust the
`MODELS_PATH` line in `faceRecognition.js` accordingly.

## 3. Drop in the new files

- `faceRecognition.js` → save as `utils/faceRecognition.js`
- `attendance.js` → replace your existing `routes/attendance.js` (this
  removes the Gemini code and `@google/genai` dependency entirely — you can
  `npm uninstall @google/genai` and remove `GEMINI_API_KEY` from your env
  if nothing else uses it)
- `enroll-face-route.js` → copy this route into your existing
  `routes/members.js` file (add the `require` at top, and the route handler
  wherever your other member routes are)

## 4. Load models at server startup

In your main server file (e.g. `server.js` / `index.js`), **before** the
server starts accepting requests:

```js
const { loadModels } = require("./utils/faceRecognition");

async function start() {
  await loadModels();
  console.log("Face recognition models ready");

  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

start();
```

This takes a second or two on boot — do it once, not per-request.

## 5. Confirm your Member schema has `faceEmbedding`

Your existing (previously unused) `/face-checkin` route already expected
this field, so it likely already exists. If not, add it to your Mongoose
Member model:

```js
faceEmbedding: { type: [Number], default: null },
```

## 6. Re-enroll existing members

Members added *before* this change only have a `photo`, not a
`faceEmbedding` — the old Gemini route never generated one. They need to be
re-enrolled once so the new matching logic can find them. Easiest options:

- Simplest: ask them to re-take their photo once via "Edit Member" (if you
  have that screen) so `enrollFace` runs again, OR
- Or write a one-time migration script that loops through existing members,
  runs `getFaceDescriptor(member.photo)` on their stored photo, and saves
  the result to `faceEmbedding` — no need to retake photos if the stored
  photo is a clear, front-facing shot. Happy to write this script if useful.

## 7. Test

1. Add a new member with a clear, front-facing, well-lit photo.
2. Check your server logs — you should see
   `[enroll-face]` succeed with no "No face detected" error.
3. Go to Attendance → Scan, and try that member's face.
4. Watch for `[face-scan] best score: 0.XX` in the logs — if it's
   consistently below `0.6` for the correct person, lower the
   `MATCH_THRESHOLD` slightly in `attendance.js` (e.g. to `0.55`) and retest.
