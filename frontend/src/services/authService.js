// src/services/authService.js
import axios from "axios";

const API_GATEWAY_URL = "http://localhost:30080";

// ─── Instance Axios avec intercepteur JWT ──────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_GATEWAY_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints (via Gateway) ────────────────────────────────────────
export const login = (data) => axios.post(`${API_GATEWAY_URL}/api/auth/login`, data);
export const register = (data) => axios.post(`${API_GATEWAY_URL}/api/auth/register`, data);
export const forgotPassword = (email) => axios.post(`${API_GATEWAY_URL}/api/auth/forgot-password`, { email });
export const resetPassword = (data) => axios.post(`${API_GATEWAY_URL}/api/auth/reset-password`, data);

export const getAllStudents = async () => {
  const response = await apiClient.get(`/api/auth/students`);
  return response.data;
};

// Récupérer les infos d'un utilisateur par son ID
export const getUserInfo = async (userId) => {
  try {
    const response = await apiClient.get(`/api/auth/users/${userId}`);
    return response;
  } catch (error) {
    console.error(`Erreur chargement user ${userId}:`, error);
    return { data: { email: `user${userId}` } };
  }
};

// Récupérer plusieurs utilisateurs en une fois
export const getMultipleUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) return {};

  const uniqueIds = [...new Set(userIds)];
  const promises = uniqueIds.map(id =>
    getUserInfo(id).catch(() => ({ data: { email: `Utilisateur ${id}` } }))
  );
  const results = await Promise.all(promises);
  const usersMap = {};
  uniqueIds.forEach((id, index) => {
    const email = results[index].data.email;
    usersMap[id] = email.split('@')[0];
  });
  return usersMap;
};