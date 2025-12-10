// models/Song.js
const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },

  // we store just the filename; controller knows "uploads/songs"
  filePath: { type: String, required: true },

  // duration in seconds
  duration: { type: Number, default: 0 },

  // simple text genre
  genre: { type: String, default: "Unknown" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Song", SongSchema);
