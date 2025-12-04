import axios from "axios";

const API = "http://localhost:5000/api/albums";

// GET ALL ALBUMS
export const getAllAlbums = async () => {
  const res = await axios.get(API);
  return res.data;
};

// GET ALBUM BY ID
export const getAlbumById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

// GET ARTIST'S OWN ALBUMS
export const getMyAlbums = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API}/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// CREATE ALBUM
export const createAlbum = async (formData) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(API, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// UPDATE ALBUM (rename, change description, replace cover)
export const updateAlbum = async (id, formData) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API}/${id}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ADD SONGS TO ALBUM
export const addSongsToAlbum = async (id, formData) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/${id}/add-songs`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// DELETE SONG FROM ALBUM
// Delete song by ID
export const deleteSongFromAlbum = async (songId) => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`http://localhost:5000/api/songs/${songId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};



// DELETE ALBUM
export const deleteAlbum = async (id) => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};
    