const router = require("express").Router();
const searchController = require("../controllers/searchController");

router.get("/", searchController.searchAll);
router.get("/genre/:genre", searchController.filterByGenre);

module.exports = router;
