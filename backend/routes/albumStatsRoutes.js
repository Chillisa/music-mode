const router = require("express").Router();
const albumStatsController = require("../controllers/albumStatsController");
const auth = require("../middleware/authMiddleware");

router.get("/:id/stats", auth.verifyToken, albumStatsController.getAlbumStats);

module.exports = router;
