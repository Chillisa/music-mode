// controllers/playlistController.js
const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const Album = require("../models/Album"); // ⭐ NEW

// ====================================
// CREATE PLAYLIST (manual, NOT from album)
// ====================================
exports.createPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, colorTheme } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Playlist title required" });
    }

    if (!req.file && !colorTheme) {
      return res.status(400).json({
        message: "Choose a color or upload a cover image",
      });
    }

    let coverPath = "";
    if (req.file) {
      coverPath = "/uploads/playlistCovers/" + req.file.filename;
    }

    const playlist = new Playlist({
      title: title.trim(),
      userId,
      coverImage: coverPath,
      colorTheme: colorTheme || null,
      songs: [],
      albumSource: null, // manual playlists are NOT album saves
    });

    await playlist.save();

    res.status(201).json({
      message: "Playlist created",
      playlist,
    });
  } catch (err) {
    console.error("CREATE PLAYLIST ERROR:", err);
    res.status(500).json({ message: "Server error creating playlist" });
  }
};


// ====================================
// CREATE PLAYLIST FROM ALBUM ⭐ NEW
// ====================================
exports.createPlaylistFromAlbum = async (req, res) => {
  try {
    const userId = req.user.id;
    const albumId = req.params.albumId;

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    const songs = await Song.find({ albumId }).sort({ createdAt: 1 });
    const songIds = songs.map(s => s._id);

    const playlist = new Playlist({
      title: album.title,
      userId,
      coverImage: album.coverImage || "",
      colorTheme: null,
      songs: songIds,
      albumSource: albumId   // ⭐ TRACK SAVES
    });

    await playlist.save();

    res.status(201).json({
      message: "Playlist created from album",
      playlist,
    });

  } catch (err) {
    console.error("CREATE PLAYLIST FROM ALBUM ERROR:", err);
    res.status(500).json({ message: "Server error creating playlist" });
  }
};


// ====================================
// GET MY PLAYLISTS
// ====================================
exports.getMyPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;

    const playlists = await Playlist.find({ userId }).sort({ createdAt: -1 });

    res.json({ playlists });

  } catch (err) {
    console.error("GET MY PLAYLISTS ERROR:", err);
    res.status(500).json({ message: "Server error fetching playlists" });
  }
};

// ====================================
// GET PLAYLIST BY ID
// ====================================
exports.getPlaylistById = async (req, res) => {
  try {
    const playlistId = req.params.id;

    const playlistDoc = await Playlist.findById(playlistId).populate({
      path: "songs",
      populate: { path: "albumId", select: "coverImage" },
    });

    if (!playlistDoc) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const playlist = playlistDoc.toObject();
    playlist.songs = [...playlist.songs].reverse();

    res.json({ playlist });

  } catch (err) {
    console.error("GET PLAYLIST ERROR:", err);
    res.status(500).json({ message: "Server error fetching playlist" });
  }
};

// ====================================
// ADD SONG TO PLAYLIST
// ====================================
exports.addSongToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    const { songId } = req.body;

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    const song = await Song.findById(songId);
    if (!song)
      return res.status(404).json({ message: "Song not found" });

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    res.json({ message: "Song added", playlist });

  } catch (err) {
    console.error("ADD SONG ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================
// UPDATE PLAYLIST
// ====================================
exports.updatePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { title, colorTheme, removeCover } = req.body;

    let updateData = {};

    if (title) updateData.title = title.trim();
    if (colorTheme) updateData.colorTheme = colorTheme;

    if (req.file) {
      updateData.coverImage = "/uploads/playlistCovers/" + req.file.filename;
    }

    if (removeCover === "true") {
      updateData.coverImage = "";
    }

    const updated = await Playlist.findByIdAndUpdate(
      playlistId,
      updateData,
      { new: true }
    );

    res.json({ message: "Playlist updated", playlist: updated });

  } catch (err) {
    console.error("UPDATE PLAYLIST ERROR:", err);
    res.status(500).json({ message: "Server error updating playlist" });
  }
};

// ====================================
// REMOVE SONG
// ====================================
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    const { songId } = req.body;

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter(
      (id) => id.toString() !== songId
    );

    await playlist.save();

    res.json({ message: "Song removed", playlist });

  } catch (err) {
    console.error("REMOVE SONG ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================
// REMOVE COVER IMAGE
// ====================================
exports.removeCover = async (req, res) => {
  try {
    const playlistId = req.params.id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    playlist.coverImage = "";
    await playlist.save();

    res.json({ message: "Cover removed", playlist });

  } catch (err) {
    console.error("REMOVE COVER ERROR:", err);
    res.status(500).json({ message: "Server error removing cover" });
  }
};

// ====================================
// DELETE PLAYLIST
// ====================================
exports.deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    await Playlist.findByIdAndDelete(playlistId);

    res.json({ message: "Playlist deleted" });

  } catch (err) {
    console.error("DELETE PLAYLIST ERROR:", err);
    res.status(500).json({ message: "Server error deleting playlist" });
  }
};
