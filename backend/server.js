// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// DB CONNECTIONS
const connectMySQL = require("./config/mysql");
const connectMongo = require("./config/mongo");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const songRoutes = require("./routes/songRoutes");
const albumRoutes = require("./routes/albumRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const likeRoutes = require("./routes/likeRoutes");
const albumStatsRoutes = require("./routes/albumStatsRoutes");

const songStatsRoutes = require("./routes/songStatsRoutes");
const browseRoutes = require("./routes/browseRoutes");
const searchRoutes = require("./routes/searchRoutes");

// ⭐ IMPORT THE ONE THAT CAUSED ERROR
const artistStatsRoutes = require("./routes/artistStatsRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving
app.use("/uploads/covers", express.static("uploads/covers"));
app.use("/uploads/songs", express.static("uploads/songs"));
app.use("/uploads/playlistCovers", express.static("uploads/playlistCovers"));

// Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "Music Mode backend is running ✅" });
});

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// SONG ROUTES
app.use("/api/songs", songRoutes);

// ALBUM ROUTES
app.use("/api/albums", albumRoutes);

// PLAYLIST ROUTES
app.use("/api/playlists", playlistRoutes);

// LIKE ROUTES
app.use("/api/likes", likeRoutes);

// ⭐ ARTIST STATS ROUTES
app.use("/api/artist", artistStatsRoutes);

// BROWSE ROUTES
app.use("/api/browse", browseRoutes);

// ALBUM STATS ROUTES
app.use("/api/albums", albumStatsRoutes);

// SONG STATS ROUTES
app.use("/api/song-stats", songStatsRoutes);

// SEARCH ROUTES
app.use("/api/search", searchRoutes);

// Protected test route
app.get("/api/protected", authMiddleware.verifyToken, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

// Start server AFTER DB connections
const startServer = async () => {
  try {
    await connectMySQL();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
