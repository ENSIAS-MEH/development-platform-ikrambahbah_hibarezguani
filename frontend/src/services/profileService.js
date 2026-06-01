// src/services/profileService.js
import axios from "axios";

const API_URL = "http://localhost:8082/api/profiles";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ========== PROFIL ==========
export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createProfile = async (data) => {
  const response = await axios.post(`${API_URL}/me`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(`${API_URL}/me`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ========== SKILLS ==========
export const addSkill = async (data) => {
  const response = await axios.post(`${API_URL}/me/skills`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteSkill = async (skillId) => {
  await axios.delete(`${API_URL}/skills/${skillId}`, {
    headers: getAuthHeader(),
  });
};

// ========== EXPERIENCES ==========
export const addExperience = async (data) => {
  const response = await axios.post(`${API_URL}/me/experiences`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ✅ AJOUTER cette fonction pour modifier une expérience
export const updateExperience = async (experienceId, data) => {
  const response = await axios.put(`${API_URL}/me/experiences/${experienceId}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteExperience = async (experienceId) => {
  await axios.delete(`${API_URL}/me/experiences/${experienceId}`, {
    headers: getAuthHeader(),
  });
};

// ========== EDUCATIONS ==========
export const addEducation = async (data) => {
  const response = await axios.post(`${API_URL}/me/educations`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteEducation = async (educationId) => {
  await axios.delete(`${API_URL}/me/educations/${educationId}`, {
    headers: getAuthHeader(),
  });
};


// ========== PROFIL PAR USER ID ==========
// Récupérer le profil d'un utilisateur par son ID
export const getProfileByUserId = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Récupérer plusieurs profils en une fois (optimisé)
export const getMultipleProfiles = async (userIds) => {
  if (!userIds || userIds.length === 0) return {};
  
  const uniqueIds = [...new Set(userIds)];
  const promises = uniqueIds.map(id => 
    getProfileByUserId(id).catch(() => null)
  );
  const results = await Promise.all(promises);
  const profilesMap = {};
  uniqueIds.forEach((id, index) => {
    if (results[index]) {
      profilesMap[id] = results[index];
    }
  });
  return profilesMap;
};