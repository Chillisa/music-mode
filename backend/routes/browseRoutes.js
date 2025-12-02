const router = require("express").Router();
const browseController = require("../controllers/browseController");

router.get("/genres", browseController.getGenres);
router.get("/genres/:name", browseController.getByGenre);

module.exports = router;
