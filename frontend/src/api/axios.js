import axios from "axios";

const api = axios.create({
  baseURL: "import.meta.env.VITE_API_UR",
  withCredentials: true,
});

// Attach JWT token stored in localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling - logs the user out on the client
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
