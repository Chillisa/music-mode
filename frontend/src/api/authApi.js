import apiClient from "./apiClient";

export const signup = async (userData) => {
  const res = await apiClient.post("/auth/register", userData);
  return res.data;
};

export const login = async (userData) => {
  const res = await apiClient.post("/auth/login", userData);
  return res.data;
};
