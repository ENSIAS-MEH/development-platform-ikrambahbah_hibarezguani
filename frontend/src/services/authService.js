import axios from "axios";

const AUTH_URL = "http://localhost:8084/api/auth";

// ─── Instance Axios avec intercepteur JWT ──────────────────────────────────
// Utilise cette instance pour tous les appels aux services protégés
export const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur réponse : déconnecte si token expiré (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints ────────────────────────────────────────────────────────
export const login = (data) => axios.post(`${AUTH_URL}/login`, data);

export const register = (data) => axios.post(`${AUTH_URL}/register`, data);

export const forgotPassword = (email) =>
  axios.post(`${AUTH_URL}/forgot-password`, { email });

export const resetPassword = (data) =>
  axios.post(`${AUTH_URL}/reset-password`, data);

export const getAllStudents = async () => {
  const response = await apiClient.get(`${AUTH_URL}/students`);
  return response.data;
};