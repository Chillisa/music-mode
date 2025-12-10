const Album = require("../models/Album");
const Song = require("../models/Song");

// ===============================
// GLOBAL SEARCH (albums + songs)
// ===============================
exports.searchAll = async (req, res) => {
  try {
    const q =
      req.query.q ||
      req.query.search ||
      req.query.query ||
      req.query.text ||
      "";

    if (!q.trim()) {
      return res.json({ albums: [], songs: [] });
    }

    const regex = { $regex: q, $options: "i" };

    // Search albums by title OR artist
    const albums = await Album.find({
      $or: [{ title: regex }, { artist: regex }],
    }).lean();

    // Search songs by title OR artist
    let songs = await Song.find({
      $or: [{ title: regex }, { artist: regex }],
    }).lean();

    // Make sure albumId is always a string (or null)
    songs = songs.map((song) => ({
      ...song,
      albumId: song.albumId ? song.albumId.toString() : null,
    }));

    res.json({ albums, songs });
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Server error searching" });
  }
};

// ===============================
// FILTER BY GENRE (albums + songs)
// ===============================
exports.filterByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const regex = { $regex: genre, $options: "i" };

    const albums = await Album.find({ genre: regex }).lean();

    let songs = await Song.find({ genre: regex }).lean();

    songs = songs.map((song) => ({
      ...song,
      albumId: song.albumId ? song.albumId.toString() : null,
    }));

    res.json({ albums, songs });
  } catch (err) {
    console.error("GENRE FILTER ERROR:", err);
    res.status(500).json({ message: "Server error filtering genre" });
  }
};
