// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMySQL = require("./config/mysql");
const connectMongo = require("./config/mongo");


const authRoutes = require("./routes/authRoutes");
const songRoutes = require("./routes/songRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const albumRoutes = require("./routes/albumRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const likeRoutes = require("./routes/likeRoutes");
const artistStatsRoutes = require("./routes/artistStatsRoutes");

const browseRoutes = require("./routes/browseRoutes");

const searchRoutes = require("./routes/searchRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads/covers", express.static("uploads/covers"));
app.use("/uploads/songs", express.static("uploads/songs"));


// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Music Mode backend is running ✅" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Song routes (upload, stream)
app.use("/api/songs", songRoutes);

// album routes
app.use("/api/albums", albumRoutes);

// playlist routes
app.use("/api/playlists", playlistRoutes);

// like routes
app.use("/api/likes", likeRoutes);

// artist stats routes
app.use("/api/artist", artistStatsRoutes);

// browse and search routes
app.use("/api/browse", browseRoutes);
app.use("/api/search", searchRoutes);



// Test protected route
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
