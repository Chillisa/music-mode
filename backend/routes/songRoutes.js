const express = require("express");
const router = express.Router();

const upload = require("../config/upload");
const songController = require("../controllers/songController");
const authMiddleware = require("../middleware/authMiddleware");

// Upload audio file
router.post(
  "/upload",
  authMiddleware.verifyToken,
  upload.single("audio"),
  songController.uploadSong
);

// Stream audio
router.get("/stream/:id", songController.streamSong);

module.exports = router;
