const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const auth = require("../middleware/authMiddleware");

router.post("/toggle", auth.verifyToken, likeController.toggleLike);
router.get("/favorites", auth.verifyToken, likeController.getFavoriteSongs);

module.exports = router;
