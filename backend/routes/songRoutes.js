const router = require("express").Router();
const songController = require("../controllers/songController");
const authMiddleware = require("../middleware/authMiddleware");   // ✅ FIXED IMPORT
const upload = require("../config/upload");  // keep this

// BUT ensure it's the default export:
console.log("UPLOAD CHECK:", upload);


// Upload songs
router.post(
  "/upload",
  authMiddleware.verifyToken,
  upload.single("audio"),
  songController.uploadSong
);

// Stream song
router.get("/stream/:id", songController.streamSong);

// Rename song  ✅ NEW
router.put(
  "/:songId",
  authMiddleware.verifyToken,
  songController.renameSong
);

// Delete song
router.delete(
  "/:songId",
  authMiddleware.verifyToken,
  songController.deleteSong
);

module.exports = router;
