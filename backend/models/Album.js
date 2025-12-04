// models/Album.js
const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  artist: String,
  coverImage: String,

  genre: { type: String, default: "Unknown" },   // ⭐ NEW

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Album", AlbumSchema);
