const express = require("express");
const router = express.Router();

const artistStatsController = require("../controllers/artistStatsController");
const auth = require("../middleware/authMiddleware");

router.get("/stats", auth.verifyToken, artistStatsController.getArtistStats);

module.exports = router;
