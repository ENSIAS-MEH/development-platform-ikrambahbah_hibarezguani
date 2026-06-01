// src/services/messagingApi.js
import { apiClient } from "./authService";

const BASE = "http://localhost:8086/api";

// ═══════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════

export const getConversations = () =>
  apiClient.get(`${BASE}/conversations/me`);

export const getConversation = (id) =>
  apiClient.get(`${BASE}/conversations/${id}`);

export const createConversation = (data) =>
  apiClient.post(`${BASE}/conversations`, data);

// ═══════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════

export const getMessages = (conversationId) =>
  apiClient.get(`${BASE}/messages/conversation/${conversationId}`);

export const sendMessage = (data) =>
  apiClient.post(`${BASE}/messages`, data);

export const updateMessageStatus = (messageId, status) =>
  apiClient.patch(`${BASE}/messages/${messageId}/status?status=${status}`);

export const markAsDelivered = (conversationId) =>
  apiClient.post(`${BASE}/messages/conversation/${conversationId}/delivered`);

/**
 * ✅ NOUVEAU : Marque TOUS les messages de l'utilisateur comme DELIVERED
 * Appelé immédiatement après la connexion WebSocket
 */
export const markAllAsDelivered = () =>
  apiClient.post(`${BASE}/messages/delivered/all`);

export const markConversationAsRead = (conversationId) =>
  apiClient.post(`${BASE}/messages/conversation/${conversationId}/read`);

export const markAsRead = (messageId) =>
  apiClient.post(`${BASE}/messages/${messageId}/read`);


// ═══════════════════════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════════════════════

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(`${BASE}/uploads`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.url;
};


// ═══════════════════════════════════════════════════════
// DELETE MESSAGE
// ═══════════════════════════════════════════════════════

export const deleteMessage = (messageId) =>
  apiClient.delete(`${BASE}/messages/${messageId}`);
