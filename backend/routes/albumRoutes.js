const express = require("express");
const router = express.Router();

const albumController = require("../controllers/albumController");
const authMiddleware = require("../middleware/authMiddleware");

// Create album (artist)
router.post("/create", authMiddleware.verifyToken, albumController.createAlbum);

// Get all albums
router.get("/all", albumController.getAllAlbums);

// Get album with songs
router.get("/:id", albumController.getAlbumWithSongs);

module.exports = router;
