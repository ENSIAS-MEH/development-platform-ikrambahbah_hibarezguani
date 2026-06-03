import { apiClient } from "./authService";

// Plus de BASE_URL, on utilise apiClient qui pointe vers Gateway

// ─── Projects ──────────────────────────────────────────────────────────────
export const getPublishedProjects = (page = 0, size = 12) =>
  apiClient.get(`/api/projects?page=${page}&size=${size}`);

export const getProject = (id) => apiClient.get(`/api/projects/${id}`);

export const getMyProjects = () => apiClient.get(`/api/projects/my`);

export const createProject = (data) => apiClient.post(`/api/projects`, data);

export const publishProject = (id) => apiClient.patch(`/api/projects/${id}/publish`);

export const archiveProject = (id) => apiClient.patch(`/api/projects/${id}/archive`);

// ─── Members ───────────────────────────────────────────────────────────────
export const getMembers = (projectId) =>
  apiClient.get(`/api/projects/${projectId}/members`);

export const removeMember = (projectId, userId) =>
  apiClient.delete(`/api/projects/${projectId}/members/${userId}`);

// ─── Join Requests ─────────────────────────────────────────────────────────
export const sendJoinRequest = (projectId, message) =>
  apiClient.post(`/api/projects/${projectId}/join-requests`, { message });

export const getJoinRequests = (projectId) =>
  apiClient.get(`/api/projects/${projectId}/join-requests`);

export const approveRequest = (projectId, requestId) =>
  apiClient.patch(`/api/projects/${projectId}/join-requests/${requestId}/approve`);

export const rejectRequest = (projectId, requestId) =>
  apiClient.patch(`/api/projects/${projectId}/join-requests/${requestId}/reject`);

export const getMyRequests = () => apiClient.get(`/api/projects/my-requests`);

export const getProjectMembers = (projectId) =>
  apiClient.get(`/api/projects/${projectId}/members`);