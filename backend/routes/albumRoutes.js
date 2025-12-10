// routes/albumRoutes.js
const router = require("express").Router();
const albumController = require("../controllers/albumController");
const authMiddleware = require("../middleware/authMiddleware");

const multer = require("multer");
const uploadCovers = multer({ dest: "uploads/covers/" });
const uploadSongs = require("../config/upload");

// CREATE ALBUM
router.post(
  "/",
  authMiddleware.verifyToken,
  uploadCovers.single("cover"),
  albumController.createAlbum
);

// GET ALL + GET MINE + GET ONE
router.get("/", albumController.getAllAlbums);
router.get("/my", authMiddleware.verifyToken, albumController.getMyAlbums);
router.get("/:id", albumController.getAlbumWithSongs);

// ADD SONGS TO ALBUM
router.post(
  "/:id/add-songs",
  authMiddleware.verifyToken,
  uploadSongs.array("songs", 25),
  albumController.addSongs
);

// UPDATE ALBUM (title / desc / cover / genre)
router.put(
  "/:id",
  authMiddleware.verifyToken,
  uploadCovers.single("cover"),
  albumController.updateAlbum
);

// DELETE ALBUM
router.delete("/:id", authMiddleware.verifyToken, albumController.deleteAlbum);

module.exports = router;
