// controllers/songController.js
const Song = require("../models/Song");
const path = require("path");

module.exports = {
  // ======================================================
  // UPLOAD SONG
  // ======================================================
  uploadSong: async (req, res) => {
    try {
      const { title, albumId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No song file uploaded" });
      }

      const artist = req.user.email; // use email from JWT

      const newSong = new Song({
        title,
        artist,
        albumId: albumId || null,
        // keep whatever format you've been using so far for single uploads
        filePath: req.file.filename,
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

  // ======================================================
  // STREAM SONG  (FIXED to handle both filePath formats)
  // ======================================================
  streamSong: async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);

      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      let relPath;

      // If filePath already looks like "uploads/..." or "/uploads/..."
      if (
        song.filePath.startsWith("/uploads/") ||
        song.filePath.startsWith("uploads/")
      ) {
        // remove any leading slash so path.join works from project root
        relPath = song.filePath.replace(/^\/+/, "");
      } else {
        // old style: just filename → put it under uploads/songs/
        relPath = path.join("uploads", "songs", song.filePath);
      }

      const filePath = path.join(__dirname, "..", relPath);

      return res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending song file:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error streaming song" });
          }
        }
      });
    } catch (err) {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming song" });
      }
    }
  },

  // ======================================================
  // RENAME SONG
  // ======================================================
  renameSong: async (req, res) => {
    try {
      const songId = req.params.songId;
      const { newTitle } = req.body;

      if (!newTitle || !newTitle.trim()) {
        return res.status(400).json({ message: "New title is required" });
      }

      const song = await Song.findById(songId);
      if (!song) return res.status(404).json({ message: "Song not found" });

      song.title = newTitle.trim();
      await song.save();

      res.json({ message: "Song renamed successfully", song });
    } catch (err) {
      console.error("Rename song error:", err);
      res.status(500).json({ message: "Server error renaming song" });
    }
  },

  // ======================================================
  // DELETE SONG
  // ======================================================
  deleteSong: async (req, res) => {
    try {
      const id = req.params.songId;
      await Song.findByIdAndDelete(id);
      res.json({ message: "Song deleted" });
    } catch (err) {
      console.error("Delete song error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};
