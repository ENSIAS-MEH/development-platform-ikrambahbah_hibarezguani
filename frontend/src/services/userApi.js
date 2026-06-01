import { apiClient } from "./authService";

const AUTH_URL = "http://localhost:8084/api/auth";

// Récupérer les infos d'un utilisateur par son ID
export const getUserInfo = async (userId) => {
  try {
    const response = await apiClient.get(`${AUTH_URL}/users/${userId}`);
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