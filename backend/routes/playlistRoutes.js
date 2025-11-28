const express = require("express");
const router = express.Router();

const playlistController = require("../controllers/playlistController");
const authMiddleware = require("../middleware/authMiddleware");

// Create playlist
router.post("/create", authMiddleware.verifyToken, playlistController.createPlaylist);

// Add song
router.post("/add", authMiddleware.verifyToken, playlistController.addSong);

// Remove song
router.post("/remove", authMiddleware.verifyToken, playlistController.removeSong);

// Delete playlist
router.delete("/:id", authMiddleware.verifyToken, playlistController.deletePlaylist);

// Get all playlists
router.get("/user/all", authMiddleware.verifyToken, playlistController.getUserPlaylists);

// Get playlist with songs
router.get("/:id", authMiddleware.verifyToken, playlistController.getPlaylist);

module.exports = router;
