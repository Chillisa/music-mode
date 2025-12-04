import axios from "axios";
const API = "http://localhost:5000/api/browse";

export const getGenres = async () => {
  const res = await axios.get(`${API}/genres`);
  return res.data;
};

export const getByGenre = async (genre) => {
  const res = await axios.get(`${API}/genres/${genre}`);
  return res.data;
};
