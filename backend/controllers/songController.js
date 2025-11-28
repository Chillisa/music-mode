const Song = require("../models/Song");
const path = require("path");

module.exports = {
  // Upload song (save file to /uploads and metadata to MongoDB)
  uploadSong: async (req, res) => {
    try {
      const { title, albumId, artist } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const newSong = new Song({
        title,
        artist,
        albumId: albumId || null,
        filePath: req.file.filename, // just the filename
      });

      await newSong.save();

      res.json({
        message: "Song uploaded successfully",
        song: newSong,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  },

  // Stream song by MongoDB id
  streamSong: async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);

      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      const filePath = path.join(__dirname, "..", "uploads", song.filePath);
      res.sendFile(filePath);
    } catch (err) {
      console.error("Stream error:", err);
      res.status(500).json({ message: "Error streaming song" });
    }
  },
};
