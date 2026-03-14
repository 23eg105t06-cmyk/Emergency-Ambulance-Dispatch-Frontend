import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://emergency-ambulance-dispatch-backend.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ambulance_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ambulance_user");
      localStorage.removeItem("ambulance_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
