const Song = require("../models/Song");
const Album = require("../models/Album");

module.exports = {

  // Get all songs
  getAllSongs: async (req, res) => {
    try {
      const songs = await Song.find().sort({ createdAt: -1 });
      res.json(songs);
    } catch (err) {
      console.error("Browse songs error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Get all albums
  getAllAlbums: async (req, res) => {
    try {
      const albums = await Album.find().sort({ createdAt: -1 });
      res.json(albums);
    } catch (err) {
      console.error("Browse albums error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

};
