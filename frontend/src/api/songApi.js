// src/api/songApi.js
import axios from "axios";
import api from "./apiClient";

export const uploadSong = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await api.post("/songs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Update song meta (title + genre)
export const renameSong = async (songId, newTitle, newGenre) => {
  const token = localStorage.getItem("token");

  const payload = {};
  if (newTitle !== undefined) payload.newTitle = newTitle;
  if (newGenre !== undefined) payload.newGenre = newGenre;

  const res = await api.put(`/songs/${songId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// LIKE / UNLIKE SONG
export const toggleLike = async (songId) => {
  const token = localStorage.getItem("token");

  const res = await api.post(
    "/likes/toggle",
    { itemId: songId, type: "song" },   // ✅ send correct format
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};


// FAVORITE SONGS
export async function getFavoriteSongs() {
  const token = localStorage.getItem("token");

  const res = await axios.get("http://localhost:5000/api/likes/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.songs;
}

// ALL SONGS (for search / add-to-playlist)
export const getAllSongs = async () => {
  const res = await api.get("/songs");
  return res.data.songs;
};
