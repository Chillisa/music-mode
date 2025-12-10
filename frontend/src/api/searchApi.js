import axios from "axios";

const API = "http://localhost:5000/api/search";

// ==============================
// GLOBAL SEARCH (songs + albums)
// ==============================
export async function searchAll(query) {
  if (!query.trim()) return { albums: [], songs: [] };

  try {
    const res = await axios.get(`${API}?q=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    console.error("Search API error:", err);
    return { albums: [], songs: [] };
  }
}

// ==============================
// GENRE SEARCH (songs + albums)
// ==============================
export async function searchByGenre(genre) {
  try {
    const res = await axios.get(`${API}/genre/${encodeURIComponent(genre)}`);
    return res.data; // { albums: [], songs: [] }
  } catch (err) {
    console.error("Genre search error:", err);
    return { albums: [], songs: [] };
  }
}
