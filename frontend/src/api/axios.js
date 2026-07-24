import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Har request me automatically token add karo (agar hai)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
