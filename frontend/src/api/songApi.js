// songApi.js
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

export const renameSong = async (songId, newTitle) => {
  const token = localStorage.getItem("token");

  const res = await api.put(
    `/songs/${songId}`,
    { newTitle },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

// ⭐ NEW — LIKE / UNLIKE SONG
export const toggleLike = async (songId) => {
  const token = localStorage.getItem("token");

  const res = await api.post(
    "/likes/toggle",
    { songId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

// ⭐ NEW — GET FAVORITE SONGS
export async function getFavoriteSongs() {
  const token = localStorage.getItem("token");

  const res = await axios.get("http://localhost:5000/api/likes/favorites", {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data.songs; // IMPORTANT!
}

