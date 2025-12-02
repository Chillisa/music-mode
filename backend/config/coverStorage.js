const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
require("dotenv").config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    if (file.mimetype.startsWith("image/")) {
      return {
        bucketName: "albumCovers",
        filename: `${Date.now()}-${file.originalname}`,
      };
    }
    return null;
  },
});

const uploadCover = multer({ storage });

module.exports = uploadCover;
