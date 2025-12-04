const router = require("express").Router();
const albumController = require("../controllers/albumController");
const authMiddleware = require("../middleware/authMiddleware");

const multer = require("multer");
const uploadCovers = multer({ dest: "uploads/covers/" });  // ✅ correct uploader
const uploadSongs = require("../config/upload");           // songs uploader

// ===============================
// CREATE ALBUM (with cover)
// ===============================
router.post(
  "/",
  authMiddleware.verifyToken,
  uploadCovers.single("cover"),     // ✅ FIXED NAME
  albumController.createAlbum
);

// ===============================
// GET ALL + GET MINE + GET ONE
// ===============================
router.get("/", albumController.getAllAlbums);
router.get("/my", authMiddleware.verifyToken, albumController.getMyAlbums);
router.get("/:id", albumController.getAlbumWithSongs);

// ===============================
// ADD SONGS TO ALBUM
// ===============================
router.post(
  "/:id/add-songs",
  authMiddleware.verifyToken,
  uploadSongs.array("songs", 25),
  albumController.addSongs
);

// ===============================
// UPDATE ALBUM
// ===============================
router.put(
  "/:id",
  authMiddleware.verifyToken,
  uploadCovers.single("cover"),
  albumController.updateAlbum
);

// ===============================
// DELETE
// ===============================
router.delete("/:id", authMiddleware.verifyToken, albumController.deleteAlbum);

module.exports = router;
