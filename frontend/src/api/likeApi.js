import axios from "axios";

const API = "http://localhost:5000/api/likes";

export const toggleLike = async (itemId, type) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API}/toggle`,
    { itemId, type },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};
