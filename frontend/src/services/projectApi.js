import { apiClient } from "./authService";

const BASE = "http://localhost:8085/api/projects";

// ─── Projects ──────────────────────────────────────────────────────────────
export const getPublishedProjects = (page = 0, size = 12) =>
  apiClient.get(`${BASE}?page=${page}&size=${size}`);

export const getProject = (id) => apiClient.get(`${BASE}/${id}`);

export const getMyProjects = () => apiClient.get(`${BASE}/my`);

export const createProject = (data) => apiClient.post(BASE, data);

export const publishProject = (id) => apiClient.patch(`${BASE}/${id}/publish`);

export const archiveProject = (id) => apiClient.patch(`${BASE}/${id}/archive`);

// ─── Members ───────────────────────────────────────────────────────────────
export const getMembers = (projectId) =>
  apiClient.get(`${BASE}/${projectId}/members`);

export const removeMember = (projectId, userId) =>
  apiClient.delete(`${BASE}/${projectId}/members/${userId}`);

// ─── Join Requests ─────────────────────────────────────────────────────────
export const sendJoinRequest = (projectId, message) =>
  apiClient.post(`${BASE}/${projectId}/join-requests`, { message });

export const getJoinRequests = (projectId) =>
  apiClient.get(`${BASE}/${projectId}/join-requests`);

export const approveRequest = (projectId, requestId) =>
  apiClient.patch(`${BASE}/${projectId}/join-requests/${requestId}/approve`);

export const rejectRequest = (projectId, requestId) =>
  apiClient.patch(`${BASE}/${projectId}/join-requests/${requestId}/reject`);

export const getMyRequests = () => apiClient.get(`${BASE}/my-requests`);

export const getProjectMembers = (projectId) =>
  apiClient.get(`${BASE}/${projectId}/members`);
