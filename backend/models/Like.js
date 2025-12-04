const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
    userId: { type: Number, required: true }, // <-- FIXED
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Like", LikeSchema);
