const router = require("express").Router();
const songStats = require("../controllers/songStatsController");
const auth = require("../middleware/authMiddleware");

router.post("/play", auth.verifyToken, songStats.incrementPlayCount);

module.exports = router;
