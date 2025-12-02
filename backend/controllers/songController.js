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

    const artist = req.user.email;  // FIX: force correct artist

    const newSong = new Song({
      title,
      artist,
      albumId: albumId || null,
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
  // STREAM SONG
  // ======================================================
  streamSong: async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);

      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "songs",
        song.filePath
      );

      res.sendFile(path.resolve(filePath));
    } catch (err) {
      console.error("Stream error:", err);
      res.status(500).json({ message: "Error streaming song" });
    }
  },
  // ======================================================
  // Rename SONG
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
  }


};
