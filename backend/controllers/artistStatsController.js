const Song = require("../models/Song");
const Album = require("../models/Album");
const { getMySQLPool } = require("../config/mysql");

exports.getArtistStats = async (req, res) => {
    try {
        const db = getMySQLPool(); // <-- IMPORTANT
        const artistEmail = req.user.email;

        // COUNT SONGS
        const totalSongs = await Song.countDocuments({ artist: artistEmail });

        // GET SONG IDS
        const songs = await Song.find({ artist: artistEmail }, "_id");
        const songIds = songs.map((s) => s._id.toString());

        let totalSongLikes = 0;
        let totalPlays = 0;

        if (songIds.length > 0) {

            // SONG LIKES
            const [songLikes] = await db.query(
                `SELECT COUNT(*) AS totalLikes 
                 FROM likes 
                 WHERE item_type='song' AND item_id IN (?)`,
                [songIds]
            );
            totalSongLikes = songLikes[0].totalLikes || 0;

            // SONG PLAYS
            const [songPlays] = await db.query(
                `SELECT SUM(play_count) AS totalPlays 
                 FROM song_stats 
                 WHERE song_id IN (?)`,
                [songIds]
            );
            totalPlays = songPlays[0].totalPlays || 0;
        }

        // GET ALBUM IDS
        const albums = await Album.find({ artist: artistEmail }, "_id");
        const albumIds = albums.map((a) => a._id.toString());

        let totalAlbumLikes = 0;

        if (albumIds.length > 0) {
            const [albumLikes] = await db.query(
                `SELECT COUNT(*) AS totalLikes
                 FROM likes
                 WHERE item_type='album' AND item_id IN (?)`,
                [albumIds]
            );
            totalAlbumLikes = albumLikes[0].totalLikes || 0;
        }

        res.json({
            artist: artistEmail,
            stats: {
                totalSongs,
                totalSongLikes,
                totalAlbumLikes,
                totalPlays
            }
        });

    } catch (error) {
        console.error("Artist stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
