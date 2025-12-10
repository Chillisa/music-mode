// controllers/songStatsController.js
const { getMySQLPool } = require("../config/mysql");

exports.incrementPlayCount = async (req, res) => {
  try {
    const db = getMySQLPool();
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "songId is required" });
    }

    // 1) Update per-user / generic stats (whatever you already had)
    await db.query(
      `
      INSERT INTO song_stats (song_id, play_count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE play_count = play_count + 1
      `,
      [songId]
    );

    // 2) Update overall total plays
    await db.query(
      `
      INSERT INTO song_total_stats (song_id, total_plays)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE total_plays = total_plays + 1
      `,
      [songId]
    );

    // 3) ⭐ NEW: update daily stats
    await db.query(
      `
      INSERT INTO song_daily_stats (song_id, play_date, play_count)
      VALUES (?, CURDATE(), 1)
      ON DUPLICATE KEY UPDATE play_count = play_count + 1
      `,
      [songId]
    );

    res.json({ message: "Play count updated" });
  } catch (err) {
    console.error("INCREMENT PLAY COUNT ERROR:", err);
    res.status(500).json({ message: "Server error updating play count" });
  }
};

exports.getSongStats = async (req, res) => {
  try {
    const db = getMySQLPool();
    const { songId } = req.params;

    // Get plays
    const [plays] = await db.query(
      `SELECT play_count FROM song_stats WHERE song_id=?`,
      [songId]
    );

    const totalPlays = plays.length > 0 ? plays[0].play_count : 0;

    // Get likes
    const [likes] = await db.query(
      `SELECT COUNT(*) AS totalLikes 
       FROM likes 
       WHERE item_id = ? AND item_type = 'song'`,
      [songId]
    );

    const totalLikes = likes[0].totalLikes || 0;

    return res.json({ totalPlays, totalLikes });

  } catch (err) {
    console.error("Song stats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
