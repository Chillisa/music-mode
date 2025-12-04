// src/api/searchApi.js
import axios from "axios";

const API = "http://localhost:5000/api/search";

export async function searchAll(query) {
  if (!query.trim()) return { albums: [], songs: [] };

  const res = await axios.get(`${API}?q=${encodeURIComponent(query)}`);
  return res.data;   // { albums: [...], songs: [...] }
}
