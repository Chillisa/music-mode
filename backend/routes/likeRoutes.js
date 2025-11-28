const express = require("express");
const router = express.Router();

const likeController = require("../controllers/likeController");
const authMiddleware = require("../middleware/authMiddleware");

// Like item
router.post("/like", authMiddleware.verifyToken, likeController.likeItem);

// Unlike
router.post("/unlike", authMiddleware.verifyToken, likeController.unlikeItem);

// Get liked songs
router.get("/songs", authMiddleware.verifyToken, likeController.getLikedSongs);

// Get liked albums
router.get("/albums", authMiddleware.verifyToken, likeController.getLikedAlbums);

module.exports = router;
