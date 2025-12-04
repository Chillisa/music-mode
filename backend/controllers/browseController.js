const Album = require("../models/Album");

module.exports = {
  getGenres: async (req, res) => {
    res.json([
      "Rock",
      "Chill",
      "Jazz",
      "Arabic",
      "K-pop",
      "Sad",
      "Energetic",
      "Good vibes",
      "Dark R&B",
      "Lo-fi",
    ]);
  },

  getByGenre: async (req, res) => {
    const genre = req.params.name;

    const albums = await Album.find({
      $or: [
        { title: new RegExp(genre, "i") },
        { description: new RegExp(genre, "i") },
      ],
    });

    res.json(albums);
  },
};
