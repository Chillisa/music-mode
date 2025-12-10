// controllers/albumStatsController.js
const Song = require("../models/Song");
const Album = require("../models/Album");
const Playlist = require("../models/Playlist");
const { getMySQLPool } = require("../config/mysql");

exports.getAlbumStats = async (req, res) => {
  try {
    const db = getMySQLPool();
    const albumId = req.params.id;

    // 1) Album
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // 2) Songs in album
    let songs = await Song.find({ albumId });
    const songIds = songs.map((s) => s._id.toString());

    let totalPlays = 0;
    let totalSongLikes = 0;
    const perSongStats = {}; // { songId: { totalLikes, totalPlays } }

    // ⭐ how many times this album was saved as playlist
    const totalAlbumSaves = await Playlist.countDocuments({
      albumSource: albumId,
    });

    // 3) Plays + likes per song
    if (songIds.length > 0) {
      // total plays per song
      const [playRows] = await db.query(
        `
          SELECT song_id, total_plays
          FROM song_total_stats
          WHERE song_id IN (?)
        `,
        [songIds]
      );

      playRows.forEach((row) => {
        perSongStats[row.song_id] = {
          totalLikes: 0,
          totalPlays: row.total_plays || 0,
        };
      });

      totalPlays = playRows.reduce(
        (sum, row) => sum + (row.total_plays || 0),
        0
      );

      // likes per song
      const [likeRows] = await db.query(
        `
          SELECT item_id AS song_id, COUNT(*) AS likeCount
          FROM likes
          WHERE item_type = 'song' AND item_id IN (?)
          GROUP BY item_id
        `,
        [songIds]
      );

      likeRows.forEach((row) => {
        if (!perSongStats[row.song_id]) {
          perSongStats[row.song_id] = { totalLikes: 0, totalPlays: 0 };
        }
        perSongStats[row.song_id].totalLikes = row.likeCount || 0;
        totalSongLikes += row.likeCount || 0;
      });
    }

    // 4) ⭐ Daily plays for this album (last 30 days)
    let dailySeries = [];
    if (songIds.length > 0) {
      const [dailyRows] = await db.query(
        `
          SELECT play_date, SUM(play_count) AS totalPlays
          FROM song_daily_stats
          WHERE song_id IN (?)
            AND play_date >= CURDATE() - INTERVAL 29 DAY
          GROUP BY play_date
          ORDER BY play_date ASC
        `,
        [songIds]
      );

      dailySeries = dailyRows.map((row) => ({
        date: row.play_date.toISOString().split("T")[0], // 'YYYY-MM-DD'
        totalPlays: row.totalPlays || 0,
      }));
    }

    // 5) Attach per-song stats (IMPORTANT: use .toString() for key)
    songs = songs.map((song) => {
      const key = song._id.toString();
      const stats = perSongStats[key] || {
        totalLikes: 0,
        totalPlays: 0,
      };
      return {
        ...song._doc,
        totalLikes: stats.totalLikes,
        totalPlays: stats.totalPlays,
      };
    });

    // 6) Return album + stats + songs
    return res.json({
      album: {
        id: album._id,
        title: album.title,
        coverImage: album.coverImage,
        createdAt: album.createdAt,
      },
      stats: {
        totalPlays,
        totalSongLikes,
        totalAlbumSaves,
        totalSongs: songs.length,
        dailySeries, // 👈 include here for the graph
      },
      songs,
    });
  } catch (err) {
    console.error("Album Stats Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
