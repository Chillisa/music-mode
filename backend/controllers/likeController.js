const Like = require("../models/Like");
const Song = require("../models/Song");
const Album = require("../models/Album");


// =======================================================
// TOGGLE LIKE
// =======================================================
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Missing songId" });
    }

    const existing = await Like.findOne({ userId, songId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      return res.json({ liked: false });
    }

    await Like.create({ userId, songId });
    return res.json({ liked: true });

  } catch (err) {
    console.error("TOGGLE LIKE ERROR:", err);
    res.status(500).json({ message: "Server error toggling like" });
  }
};



// =======================================================
// GET FAVORITE SONGS  (FIXED VERSION)
// =======================================================
exports.getFavoriteSongs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Load likes with song + album populated
    let likes = await Like.find({ userId })
      .populate({
        path: "songId",
        populate: { path: "albumId", model: "Album" }
      });

    // FILTER OUT INVALID SONGS (null references)
    likes = likes.filter(like => like.songId !== null);

    // Optional: auto-clean DB of broken likes
    await Like.deleteMany({ userId, songId: null });

    // Build final song objects safely
    const songs = likes.map(like => {
      const song = like.songId;

      return {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        filePath: song.filePath,  // your PlayerContext uses this
        duration: 0,              // frontend loads this
        coverImage: song.albumId?.coverImage || "/default.jpg"
      };
    });

    res.json({ songs });

  } catch (err) {
    console.error("GET FAVORITES ERROR:", err);
    res.status(500).json({ message: "Server error fetching favorite songs" });
  }
};
