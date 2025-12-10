const Song = require("../models/Song");
const path = require("path");
const mm = require("music-metadata");
const { getMySQLPool } = require("../config/mysql");

module.exports = {

  // ======================================================
  // UPLOAD SONG (with duration extraction)
  // ======================================================
  uploadSong: async (req, res) => {
    try {
      const { title, albumId, genre } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No song file uploaded" });
      }

      const artist = req.user.email;

      const fullPath = path.join(
        __dirname,
        "..",
        "uploads",
        "songs",
        req.file.filename
      );

      let duration = 0;
      try {
        const metadata = await mm.parseFile(fullPath);
        duration = Math.floor(metadata.format.duration || 0);
      } catch (err) {
        console.log("Could not extract duration:", err.message);
      }

      const newSong = new Song({
        title,
        artist,
        albumId: albumId || null,
        filePath: req.file.filename,
        duration,
        genre: genre || "Unknown",
      });

      await newSong.save();

      return res.json({
        message: "Song uploaded successfully",
        song: newSong,
      });

    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  },

  // ======================================================
  // STREAM SONG + RECORD PLAY COUNT
  // ======================================================
 streamSong: async (req, res) => {
    try {
      const songId = req.params.id;
      const song = await Song.findById(songId);
      if (!song) return res.status(404).json({ message: "Song not found" });

      // Just resolve file path and send the file
      let relPath;

      if (
        song.filePath.startsWith("/uploads/") ||
        song.filePath.startsWith("uploads/")
      ) {
        relPath = song.filePath.replace(/^\/+/, "");
      } else {
        relPath = path.join("uploads", "songs", song.filePath);
      }

      const fullPath = path.join(__dirname, "..", relPath);

      return res.sendFile(fullPath, (err) => {
        if (err && !res.headersSent) {
          console.error("Error streaming song:", err);
          res.status(500).json({ message: "Error streaming song" });
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
  // UPDATE SONG TITLE + GENRE
  // ======================================================
  renameSong: async (req, res) => {
    try {
      const { songId } = req.params;
      const { newTitle, newGenre } = req.body;

      if (
        (!newTitle || !newTitle.trim()) &&
        (!newGenre || !newGenre.trim())
      ) {
        return res
          .status(400)
          .json({ message: "Nothing to update (title / genre missing)" });
      }

      const song = await Song.findById(songId);
      if (!song) return res.status(404).json({ message: "Song not found" });

      if (newTitle && newTitle.trim()) {
        song.title = newTitle.trim();
      }
      if (newGenre && newGenre.trim()) {
        song.genre = newGenre.trim();
      }

      await song.save();

      res.json({ message: "Song updated", song });

    } catch (err) {
      console.error("Rename error:", err);
      res.status(500).json({ message: "Server error renaming song" });
    }
  },

  // ======================================================
  // DELETE SONG
  // ======================================================
  deleteSong: async (req, res) => {
    try {
      await Song.findByIdAndDelete(req.params.songId);

      res.json({ message: "Song deleted" });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Server error deleting song" });
    }
  },

  // ======================================================
  // GET ALL SONGS 
  // ======================================================
  getAllSongs: async (req, res) => {
    try {
      const songs = await Song.find().sort({ createdAt: -1 });
      res.json({ songs });
    } catch (err) {
      console.error("Get all songs error:", err);
      res.status(500).json({ message: "Server error fetching songs" });
    }
  },

}; // <-- THIS WAS MISSING BEFORE
