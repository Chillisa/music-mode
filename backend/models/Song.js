const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
  filePath: { type: String, required: true }, // filename on disk
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Song", SongSchema);
