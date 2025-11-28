const express = require("express");
const router = express.Router();
const browseController = require("../controllers/browseController");

// Public browse routes
router.get("/songs", browseController.getAllSongs);
router.get("/albums", browseController.getAllAlbums);

module.exports = router;
