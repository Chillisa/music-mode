// songApi.js
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

  const res = await api.put(`/songs/${songId}`, { newTitle }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
};

