import apiClient from "./apiClient";

export const getHealth = async () => {
  const res = await apiClient.get("/health");
  return res.data;
};
