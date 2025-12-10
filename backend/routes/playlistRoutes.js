// routes/playlistRoutes.js
const router = require("express").Router();
const playlistController = require("../controllers/playlistController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/playlistUpload");

// Create playlist (manual)
router.post(
  "/",
  authMiddleware.verifyToken,
  upload.single("coverImage"),
  playlistController.createPlaylist
);

// ⭐ Create playlist from album
router.post(
  "/from-album/:albumId",
  authMiddleware.verifyToken,
  playlistController.createPlaylistFromAlbum
);

// My playlists
router.get(
  "/my",
  authMiddleware.verifyToken,
  playlistController.getMyPlaylists
);

// Single playlist
router.get(
  "/:id",
  authMiddleware.verifyToken,
  playlistController.getPlaylistById
);

// Add song
router.post(
  "/:id/add-song",
  authMiddleware.verifyToken,
  playlistController.addSongToPlaylist
);

// Update playlist
router.put(
  "/:id",
  authMiddleware.verifyToken,
  upload.single("coverImage"),
  playlistController.updatePlaylist
);

// Remove song
router.post(
  "/:id/remove-song",
  authMiddleware.verifyToken,
  playlistController.removeSongFromPlaylist
);

// Remove cover
router.put(
  "/:id/remove-cover",
  authMiddleware.verifyToken,
  playlistController.removeCover
);

// Delete playlist
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  playlistController.deletePlaylist
);

module.exports = router;
