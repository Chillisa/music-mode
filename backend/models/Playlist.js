const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema({
  title: { type: String, required: true },

  userId: {
    type: String,
    required: true
  },

  coverImage: { type: String, default: "" },
  colorTheme: { type: String, default: null },

  // ⭐ NEW FIELD: tracks which album this playlist came from
  albumSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    default: null
  },

  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Playlist", PlaylistSchema);
