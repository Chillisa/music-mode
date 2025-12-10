// routes/songRoutes.js
const router = require("express").Router();
const songController = require("../controllers/songController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/upload");

// Upload song
router.post(
  "/upload",
  authMiddleware.verifyToken,
  upload.single("audio"),
  songController.uploadSong
);

// Stream song
router.get("/stream/:id", songController.streamSong);

// Update title / genre
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

// Get all songs
router.get("/", songController.getAllSongs);

module.exports = router;
