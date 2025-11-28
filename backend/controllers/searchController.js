const Song = require("../models/Song");
const Album = require("../models/Album");

module.exports = {
  search: async (req, res) => {
    try {
      const query = req.query.q;

      if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Search query is required" });
      }

      const regex = new RegExp(query, "i"); // case-insensitive search

      const songs = await Song.find({
        $or: [
          { title: regex },
          { artist: regex }
        ]
      });

      const albums = await Album.find({
        $or: [
          { title: regex },
          { artist: regex }
        ]
      });

      res.json({
        query,
        results: {
          songs,
          albums
        }
      });

    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};
