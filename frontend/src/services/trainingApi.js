import { apiClient } from "./authService";

// plus de BASE_URL

// ═══════════════════════════════════════════════════════
// FORMATIONS (CRUD + publication)
// ═══════════════════════════════════════════════════════

export const getPublishedTrainings = () =>
  apiClient.get(`/api/trainings`);

export const getMyTrainings = () =>
  apiClient.get(`/api/trainings/me`);

export const getTrainingById = (id) =>
  apiClient.get(`/api/trainings/${id}`);

export const createTraining = (data) =>
  apiClient.post(`/api/trainings`, data);

export const updateTraining = (id, data) =>
  apiClient.put(`/api/trainings/${id}`, data);

export const deleteTraining = (id) =>
  apiClient.delete(`/api/trainings/${id}`);

export const publishTraining = (id) =>
  apiClient.post(`/api/trainings/${id}/publish`);

// ═══════════════════════════════════════════════════════
// INSCRIPTIONS
// ═══════════════════════════════════════════════════════

export const enrollFreeTraining = (trainingId) =>
  apiClient.post(`/api/trainings/${trainingId}/enroll`);

export const enrollPaidTraining = (trainingId, paymentData) =>
  apiClient.post(`/api/trainings/${trainingId}/enroll-paid`, paymentData);

export const getMyEnrollments = () =>
  apiClient.get(`/api/trainings/my-enrollments`);

// ═══════════════════════════════════════════════════════
// RESSOURCES
// ═══════════════════════════════════════════════════════

export const getTrainingResources = (trainingId) =>
  apiClient.get(`/api/trainings/${trainingId}/resources`);

export const addResource = (trainingId, data) =>
  apiClient.post(`/api/trainings/${trainingId}/resources`, data);

export const deleteResource = (resourceId) =>
  apiClient.delete(`/api/trainings/resources/${resourceId}`);

// ═══════════════════════════════════════════════════════
// AVIS / NOTES
// ═══════════════════════════════════════════════════════

export const getTrainingReviews = (trainingId) =>
  apiClient.get(`/api/trainings/${trainingId}/reviews`);

export const addReview = (trainingId, data) =>
  apiClient.post(`/api/trainings/${trainingId}/reviews`, data);