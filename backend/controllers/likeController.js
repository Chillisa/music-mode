const { getMySQLPool } = require("../config/mysql");
const Song = require("../models/Song");
const Album = require("../models/Album");

module.exports = {

  likeItem: async (req, res) => {
    try {
      const { itemId, itemType } = req.body;
      const userId = req.user.id;

      const pool = getMySQLPool();

      // Check if already liked
      const [existing] = await pool.query(
        "SELECT * FROM likes WHERE user_id = ? AND item_id = ?",
        [userId, itemId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Already liked" });
      }

      // Insert like
      await pool.query(
        "INSERT INTO likes (user_id, item_id, item_type) VALUES (?, ?, ?)",
        [userId, itemId, itemType]
      );

      res.json({ message: "Liked successfully" });

    } catch (err) {
      console.error("Like error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  unlikeItem: async (req, res) => {
    try {
      const { itemId } = req.body;
      const userId = req.user.id;

      const pool = getMySQLPool();

      await pool.query(
        "DELETE FROM likes WHERE user_id = ? AND item_id = ?",
        [userId, itemId]
      );

      res.json({ message: "Unliked successfully" });

    } catch (err) {
      console.error("Unlike error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getLikedSongs: async (req, res) => {
    try {
      const userId = req.user.id;
      const pool = getMySQLPool();

      // Get liked songs (IDs)
      const [rows] = await pool.query(
        "SELECT item_id FROM likes WHERE user_id = ? AND item_type = 'song'",
        [userId]
      );

      const songIds = rows.map(r => r.item_id);

      // Fetch songs from MongoDB
      const songs = await Song.find({ _id: { $in: songIds } });

      res.json(songs);
      
    } catch (err) {
      console.error("Get liked songs error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getLikedAlbums: async (req, res) => {
    try {
      const userId = req.user.id;
      const pool = getMySQLPool();

      // Get liked albums (IDs)
      const [rows] = await pool.query(
        "SELECT item_id FROM likes WHERE user_id = ? AND item_type = 'album'",
        [userId]
      );

      const albumIds = rows.map(r => r.item_id);

      const albums = await Album.find({ _id: { $in: albumIds } });

      res.json(albums);

    } catch (err) {
      console.error("Get liked albums error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};
