const { getMySQLPool } = require("../config/mysql");
const Song = require("../models/Song");  // to lookup song data from MongoDB

module.exports = {

  // Create playlist
  createPlaylist: async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.user.id;

      const pool = getMySQLPool();

      const [result] = await pool.query(
        "INSERT INTO playlists (user_id, name) VALUES (?, ?)",
        [userId, name]
      );

      res.json({
        message: "Playlist created",
        playlistId: result.insertId,
      });
    } catch (err) {
      console.error("Create playlist error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Add song to playlist
  addSong: async (req, res) => {
    try {
      const { playlistId, songId } = req.body;
      const pool = getMySQLPool();

      // insert song into playlist
      await pool.query(
        "INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)",
        [playlistId, songId]
      );

      res.json({ message: "Song added to playlist" });

    } catch (err) {
      console.error("Add song error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Get all playlists for logged user
  getUserPlaylists: async (req, res) => {
    try {
      const userId = req.user.id;
      const pool = getMySQLPool();

      const [rows] = await pool.query(
        "SELECT * FROM playlists WHERE user_id = ?",
        [userId]
      );

      res.json(rows);

    } catch (err) {
      console.error("Get playlists error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Get a playlist with songs
  getPlaylist: async (req, res) => {
    try {
      const playlistId = req.params.id;
      const pool = getMySQLPool();

      // get playlist info
      const [playlists] = await pool.query(
        "SELECT * FROM playlists WHERE id = ?",
        [playlistId]
      );

      if (playlists.length === 0)
        return res.status(404).json({ message: "Playlist not found" });

      // get songs inside playlist
      const [links] = await pool.query(
        "SELECT song_id FROM playlist_songs WHERE playlist_id = ?",
        [playlistId]
      );

      // fetch each MongoDB song by its ID
      const songs = await Promise.all(
        links.map(async (link) => {
          return await Song.findById(link.song_id);
        })
      );

      res.json({
        playlist: playlists[0],
        songs,
      });

    } catch (err) {
      console.error("Get playlist error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Remove song from playlist
  removeSong: async (req, res) => {
    try {
      const { playlistId, songId } = req.body;
      const pool = getMySQLPool();

      await pool.query(
        "DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?",
        [playlistId, songId]
      );

      res.json({ message: "Song removed" });

    } catch (err) {
      console.error("Remove song error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Delete playlist
  deletePlaylist: async (req, res) => {
    try {
      const playlistId = req.params.id;
      const pool = getMySQLPool();

      await pool.query(
        "DELETE FROM playlists WHERE id = ?",
        [playlistId]
      );

      res.json({ message: "Playlist deleted" });

    } catch (err) {
      console.error("Delete playlist error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

};
