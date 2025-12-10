// middleware/upload.js  (or whatever name songRoutes uses)
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const songsDir = path.join(__dirname, "..", "uploads", "songs");

// make sure folder exists
if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ⭐ SAVE INTO uploads/songs
    cb(null, songsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
