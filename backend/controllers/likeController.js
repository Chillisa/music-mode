// controllers/likeController.js
const Like = require("../models/Like");
const Song = require("../models/Song");
const { getMySQLPool } = require("../config/mysql");



// =======================================================
// UNIVERSAL TOGGLE LIKE (SONG + ALBUM)
// =======================================================
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId)
      return res.status(400).json({ message: "Missing itemId" });

    const db = getMySQLPool();

    // Check if the song is already liked
    const [existing] = await db.query(
      `SELECT * FROM likes WHERE user_id=? AND item_id=? AND item_type='song'`,
      [userId, itemId]
    );

    if (existing.length > 0) {
      // UNLIKE
      await db.query(
        `DELETE FROM likes WHERE user_id=? AND item_id=? AND item_type='song'`,
        [userId, itemId]
      );
      return res.json({ liked: false });
    }

    // LIKE SONG
    await db.query(
      `INSERT INTO likes (user_id, item_id, item_type)
       VALUES (?, ?, 'song')`,
      [userId, itemId]
    );

    res.json({ liked: true });

  } catch (err) {
    console.error("TOGGLE LIKE ERROR:", err);
    res.status(500).json({ message: "Server error toggling like" });
  }
};


// =======================================================
// GET FAVORITE SONGS (LATEST FIRST)
// =======================================================
exports.getFavoriteSongs = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getMySQLPool();

    // 1️⃣ Get song IDs in order of LIKE time (newest first)
    const [rows] = await db.query(
      `SELECT item_id
       FROM likes
       WHERE user_id = ? AND item_type = 'song'
       ORDER BY id DESC`,          // 🔥 newest like has highest id
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ songs: [] });
    }

    const songIds = rows.map((r) => r.item_id);

    // 2️⃣ Fetch songs from Mongo in that order
    // Mongo doesn't keep our custom order, so we rebuild it.
    let songs = await Song.find({ _id: { $in: songIds } }).populate("albumId");
    songs = songs.filter((s) => s != null);

    const songMap = new Map();
    songs.forEach((s) => {
      songMap.set(String(s._id), s);
    });

    const orderedSongs = songIds
      .map((id) => songMap.get(id))
      .filter((s) => s);

    const formatted = orderedSongs.map((song) => ({
      _id: song._id,
      title: song.title,
      artist: song.artist,
      filePath: song.filePath,
      duration: song.duration || 0,
      coverImage: song.albumId?.coverImage || "/default.jpg",
    }));

    res.json({ songs: formatted });
  } catch (err) {
    console.error("GET FAVORITES ERROR:", err);
    res.status(500).json({ message: "Server error fetching favorite songs" });
  }
};


