const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true }, // username or user ID
  description: { type: String, default: "" },
  coverImage: { type: String, default: "" }, // optional for now
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Album", AlbumSchema);
