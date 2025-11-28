const Album = require("../models/Album");
const Song = require("../models/Song");

module.exports = {
  createAlbum: async (req, res) => {
    try {
      const { title, description } = req.body;

      const newAlbum = new Album({
        title,
        description,
        artist: req.user.email // or req.user.id
      });

      await newAlbum.save();

      res.json({
        message: "Album created successfully",
        album: newAlbum,
      });
    } catch (err) {
      console.error("Album create error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getAllAlbums: async (req, res) => {
    try {
      const albums = await Album.find().sort({ createdAt: -1 });
      res.json(albums);
    } catch (err) {
      console.error("Get albums error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getAlbumWithSongs: async (req, res) => {
    try {
      const albumId = req.params.id;

      const album = await Album.findById(albumId);
      if (!album) return res.status(404).json({ message: "Album not found" });

      const songs = await Song.find({ albumId });

      res.json({
        album,
        songs,
      });
    } catch (err) {
      console.error("Album fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};
