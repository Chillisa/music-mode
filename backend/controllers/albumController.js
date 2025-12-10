// controllers/albumController.js
const Album = require("../models/Album");
const Song = require("../models/Song");
const mm = require("music-metadata");
const path = require("path");

module.exports = {
  // =========================
  // CREATE ALBUM
  // =========================
  createAlbum: async (req, res) => {
    try {
      const { title, description, genre } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Album title is required" });
      }

      const artist = req.user?.email;
      if (!artist) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let coverImage = "";
      if (req.file) {
        coverImage = `/uploads/covers/${req.file.filename}`;
      }

      const newAlbum = new Album({
        title,
        description,
        genre,
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

  // =========================
  // GET ALL ALBUMS
  // =========================
  getAllAlbums: async (req, res) => {
    try {
      const albums = await Album.find().sort({ createdAt: -1 });
      res.json(albums);
    } catch (err) {
      console.error("Get albums error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // =========================
  // GET ALBUM + SONGS
  // =========================
  getAlbumWithSongs: async (req, res) => {
    try {
      const albumId = req.params.id;

      const album = await Album.findById(albumId);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }

      // newest first
      const songs = await Song.find({ albumId }).sort({ createdAt: -1 });

      res.json({ album, songs });
    } catch (err) {
      console.error("Album fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // =========================
  // GET ARTIST'S ALBUMS
  // =========================
  getMyAlbums: async (req, res) => {
    try {
      const artistEmail = req.user?.email;

      if (!artistEmail) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const albums = await Album.find({ artist: artistEmail }).sort({
        createdAt: -1,
      });

      const albumsWithCounts = await Promise.all(
        albums.map(async (album) => {
          const songCount = await Song.countDocuments({ albumId: album._id });
          return { ...album.toObject(), songsCount: songCount };
        })
      );

      res.json(albumsWithCounts);
    } catch (err) {
      console.error("Get my albums error:", err);
      res
        .status(500)
        .json({ message: "Server error fetching artist albums" });
    }
  },

  // =========================
  // UPDATE ALBUM (title / desc / cover / genre)
  // =========================
  updateAlbum: async (req, res) => {
    try {
      const albumId = req.params.id;

      const album = await Album.findById(albumId);
      if (!album) return res.status(404).json({ message: "Album not found" });

      if (album.artist !== req.user.email) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { title, description, genre } = req.body;

      if (title) album.title = title;
      if (description) album.description = description;
      if (genre) album.genre = genre;

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

  // =========================
  // ADD SONGS TO ALBUM
  //  - uses titles[] and genres[] arrays from FormData
  //  - extracts duration with music-metadata
  // =========================
  addSongs: async (req, res) => {
    try {
      const albumId = req.params.id;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No songs uploaded" });
      }

      let { titles = [], genres = [] } = req.body;

      // FormData sends single value as string, multiple as array
      if (!Array.isArray(titles)) titles = [titles];
      if (!Array.isArray(genres)) genres = [genres];

      const inserted = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const titleFromClient = titles[i];
        const genreFromClient = genres[i];

        const title =
          titleFromClient && titleFromClient.trim().length > 0
            ? titleFromClient.trim()
            : file.originalname.replace(/\.[^/.]+$/, "");

        const genre =
          genreFromClient && genreFromClient.trim().length > 0
            ? genreFromClient.trim()
            : "Unknown";

        // duration from actual file path
        let duration = 0;
        try {
          const metadata = await mm.parseFile(file.path);
          duration = Math.floor(metadata.format.duration || 0);
        } catch (err) {
          console.log("Could not read duration for", file.filename, err.message);
        }

        const song = new Song({
          albumId,
          artist: req.user.email,
          title,
          filePath: file.filename, // keep same style as uploadSong
          genre,
          duration,
        });

        await song.save();
        inserted.push(song);
      }

      res.json({ message: "Songs added!", songs: inserted });
    } catch (err) {
      console.error("Add songs error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // =========================
  // DELETE SONG (used from EditAlbumPage)
  // =========================
  deleteSong: async (req, res) => {
    try {
      const id = req.params.songId;
      await Song.findByIdAndDelete(id);
      res.json({ message: "Song deleted!" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // =========================
  // DELETE ALBUM + SONGS
  // =========================
  deleteAlbum: async (req, res) => {
    try {
      const artistEmail = req.user?.email;
      const albumId = req.params.id;

      const album = await Album.findById(albumId);
      if (!album) return res.status(404).json({ message: "Album not found" });

      if (album.artist !== artistEmail) {
        return res.status(403).json({ message: "You do not own this album" });
      }

      await Song.deleteMany({ albumId });
      await Album.findByIdAndDelete(albumId);

      res.json({ message: "Album deleted successfully" });
    } catch (err) {
      console.error("Delete album error:", err);
      res.status(500).json({ message: "Server error deleting album" });
    }
  },
};
