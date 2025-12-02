const Album = require("../models/Album");
const Song = require("../models/Song");

module.exports = {
  // ======================================================
  // CREATE ALBUM — saves cover + album metadata
  // ======================================================
  createAlbum: async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Album title is required" });
      }

      // Artist email from JWT token
      const artist = req.user?.email;

      if (!artist) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Multer stores file in /uploads/covers/
      let coverImage = "";
      if (req.file) {
        coverImage = `/uploads/covers/${req.file.filename}`;
      }

      const newAlbum = new Album({
        title,
        description,
        artist,
        coverImage,
      });

      await newAlbum.save();

      res.status(201).json({
        message: "Album created successfully",
        album: newAlbum,
      });
    } catch (err) {
      console.error("Album create error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ======================================================
  // GET ALL ALBUMS — used for public browsing
  // ======================================================
  getAllAlbums: async (req, res) => {
    try {
      const albums = await Album
        .find()
        .sort({ createdAt: -1 });

      res.json(albums);
    } catch (err) {
      console.error("Get albums error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ======================================================
  // GET ALBUM + SONGS — used in AlbumPage
  // ======================================================
  getAlbumWithSongs: async (req, res) => {
    try {
      const albumId = req.params.id;

      const album = await Album.findById(albumId);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }

      const songs = await Song.find({ albumId });

      res.json({
        album,
        songs,
      });
    } catch (err) {
      console.error("Album fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ======================================================
  // GET ONLY ARTIST'S OWN ALBUMS — for Artist Library
  // ======================================================
  getMyAlbums: async (req, res) => {
  try {
    const artistEmail = req.user?.email;

    if (!artistEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch albums belonging to this artist
    const albums = await Album.find({ artist: artistEmail }).sort({ createdAt: -1 });

    // Add song count for each album
    const albumsWithCounts = await Promise.all(
      albums.map(async (album) => {
        const songCount = await Song.countDocuments({ albumId: album._id });
        return {
          ...album.toObject(),
          songsCount: songCount,
        };
      })
    );

    res.json(albumsWithCounts);

  } catch (err) {
    console.error("Get my albums error:", err);
    res.status(500).json({ message: "Server error fetching artist albums" });
  }
},

  // ======================================================
  // Update album
  // ======================================================
updateAlbum: async (req, res) => {
  try {
    const albumId = req.params.id;

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    // Only album owner can edit
    if (album.artist !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, description } = req.body;

    if (title) album.title = title;
    if (description) album.description = description;

    // Replace cover if new upload exists
    if (req.file) {
      album.coverImage = `/uploads/covers/${req.file.filename}`;
    }

    await album.save();

    res.json({ message: "Album updated!", album });
  } catch (err) {
    console.error("Update album error:", err);
    res.status(500).json({ message: "Server error" });
  }
},


addSongs: async (req, res) => {
  try {
    const albumId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No songs uploaded" });
    }

    const inserted = [];

    for (let file of req.files) {
      const song = new Song({
        albumId,
        artist: req.user.email,
        title: file.originalname.replace(".mp3", ""),
        filePath: file.filename,
      });

      await song.save();
      inserted.push(song);
    }

    res.json({ message: "Songs added!", songs: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
},

deleteSong: async (req, res) => {
  try {
    const id = req.params.songId;
    await Song.findByIdAndDelete(id);
    res.json({ message: "Song deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
},

  // ======================================================
  // DELETE ALBUM — deletes album + ALL songs inside it
  // ======================================================
  deleteAlbum: async (req, res) => {
  try {
    const artistEmail = req.user?.email;
    const albumId = req.params.id;

    // Validate album ownership
    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (album.artist !== artistEmail) {
      return res.status(403).json({ message: "You do not own this album" });
    }

    // Delete songs
    await Song.deleteMany({ albumId });

    // Delete album
    await Album.findByIdAndDelete(albumId);

    res.json({ message: "Album deleted successfully" });

  } catch (err) {
    console.error("Delete album error:", err);
    res.status(500).json({ message: "Server error deleting album" });
  }
},

};
