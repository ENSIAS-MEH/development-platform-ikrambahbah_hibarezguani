// src/services/trainingApi.js
import { apiClient } from "./authService";

const BASE = "http://localhost:8087/api/trainings";

// ═══════════════════════════════════════════════════════
// FORMATIONS (CRUD + publication)
// ═══════════════════════════════════════════════════════

// Liste des formations publiées (étudiants)
export const getPublishedTrainings = () =>
  apiClient.get(BASE);

// Liste des formations du mentor connecté
export const getMyTrainings = () =>
  apiClient.get(`${BASE}/me`);

// Détail d'une formation
export const getTrainingById = (id) =>
  apiClient.get(`${BASE}/${id}`);

// Créer une formation (mentor)
export const createTraining = (data) =>
  apiClient.post(BASE, data);

// Mettre à jour une formation (mentor)
export const updateTraining = (id, data) =>
  apiClient.put(`${BASE}/${id}`, data);

// Supprimer une formation (mentor)
export const deleteTraining = (id) =>
  apiClient.delete(`${BASE}/${id}`);

// Publier une formation (brouillon → publiée)
export const publishTraining = (id) =>
  apiClient.post(`${BASE}/${id}/publish`);

// ═══════════════════════════════════════════════════════
// INSCRIPTIONS (étudiant)
// ═══════════════════════════════════════════════════════

// Inscription gratuite
export const enrollFreeTraining = (trainingId) =>
  apiClient.post(`${BASE}/${trainingId}/enroll`);

// Inscription payante (avec simulation de paiement)
export const enrollPaidTraining = (trainingId, paymentData) =>
  apiClient.post(`${BASE}/${trainingId}/enroll-paid`, paymentData);

// Récupérer les formations auxquelles l'étudiant est inscrit
export const getMyEnrollments = () =>
  apiClient.get(`${BASE}/my-enrollments`);

// ═══════════════════════════════════════════════════════
// RESSOURCES PÉDAGOGIQUES (mentor)
// ═══════════════════════════════════════════════════════

// Récupérer les ressources d'une formation
export const getTrainingResources = (trainingId) =>
  apiClient.get(`${BASE}/${trainingId}/resources`);

// Ajouter une ressource
export const addResource = (trainingId, data) =>
  apiClient.post(`${BASE}/${trainingId}/resources`, data);

// Supprimer une ressource
export const deleteResource = (resourceId) =>
  apiClient.delete(`${BASE}/resources/${resourceId}`);

// ═══════════════════════════════════════════════════════
// AVIS / NOTES (étudiant)
// ═══════════════════════════════════════════════════════

// Récupérer les avis d'une formation
export const getTrainingReviews = (trainingId) =>
  apiClient.get(`${BASE}/${trainingId}/reviews`);

// Ajouter un avis (étudiant inscrit)
export const addReview = (trainingId, data) =>
  apiClient.post(`${BASE}/${trainingId}/reviews`, data);