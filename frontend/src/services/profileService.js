// src/services/profileService.js
import axios from "axios";
import { apiClient } from "./authService";

// Utilise apiClient qui pointe déjà vers le Gateway
// Plus besoin de API_URL séparée

// ========== PROFIL ==========
export const getProfile = async () => {
  const response = await apiClient.get(`/api/profiles/me`);
  return response.data;
};

export const createProfile = async (data) => {
  const response = await apiClient.post(`/api/profiles/me`, data);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await apiClient.put(`/api/profiles/me`, data);
  return response.data;
};

// ========== SKILLS ==========
export const addSkill = async (data) => {
  const response = await apiClient.post(`/api/profiles/me/skills`, data);
  return response.data;
};

export const deleteSkill = async (skillId) => {
  await apiClient.delete(`/api/profiles/skills/${skillId}`);
};

// ========== EXPERIENCES ==========
export const addExperience = async (data) => {
  const response = await apiClient.post(`/api/profiles/me/experiences`, data);
  return response.data;
};

export const updateExperience = async (experienceId, data) => {
  const response = await apiClient.put(`/api/profiles/me/experiences/${experienceId}`, data);
  return response.data;
};

export const deleteExperience = async (experienceId) => {
  await apiClient.delete(`/api/profiles/me/experiences/${experienceId}`);
};

// ========== EDUCATIONS ==========
export const addEducation = async (data) => {
  const response = await apiClient.post(`/api/profiles/me/educations`, data);
  return response.data;
};

export const deleteEducation = async (educationId) => {
  await apiClient.delete(`/api/profiles/me/educations/${educationId}`);
};

// ========== PROFIL PAR USER ID ==========
export const getProfileByUserId = async (userId) => {
  const response = await apiClient.get(`/api/profiles/users/${userId}`);
  return response.data;
};

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