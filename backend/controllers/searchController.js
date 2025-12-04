// backend/controllers/searchController.js
const Album = require("../models/Album");
const Song = require("../models/Song");

// ===============================
// GLOBAL SEARCH (albums + songs)
// ===============================
exports.searchAll = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q || q.trim() === "") {
      return res.json({ albums: [], songs: [] });
    }

    const albums = await Album.find({
      title: { $regex: q, $options: "i" }
    });

    const songs = await Song.find({
      title: { $regex: q, $options: "i" }
    });

    res.json({ albums, songs });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Server error searching" });
  }
};

// ===============================
// FILTER BY GENRE
// ===============================
exports.filterByGenre = async (req, res) => {
  try {
    const { genre } = req.params;

    const albums = await Album.find({ genre });
    const songs = await Song.find({ genre });

    res.json({ albums, songs });

  } catch (err) {
    console.error("GENRE FILTER ERROR:", err);
    res.status(500).json({ message: "Server error filtering genre" });
  }
};
