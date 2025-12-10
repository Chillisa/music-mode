// src/api/playlistApi.js
import api from "./apiClient";

export const createPlaylist = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await api.post("/playlists", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createPlaylistFromAlbum = async (albumId) => {
  const token = localStorage.getItem("token");

  const res = await api.post(
    `/playlists/from-album/${albumId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

export const getMyPlaylists = async () => {
  const token = localStorage.getItem("token");
  const res = await api.get("/playlists/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.playlists;
};

export const getPlaylistById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await api.get(`/playlists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.playlist;
};

export const addSongToPlaylist = async (playlistId, songId) => {
  const token = localStorage.getItem("token");
  const res = await api.post(
    `/playlists/${playlistId}/add-song`,
    { songId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const token = localStorage.getItem("token");
  const res = await api.post(
    `/playlists/${playlistId}/remove-song`,
    { songId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const updatePlaylist = async (playlistId, formData) => {
  const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data;
};

export const deletePlaylist = async (playlistId) => {
  const token = localStorage.getItem("token");

  const res = await api.delete(`/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};
