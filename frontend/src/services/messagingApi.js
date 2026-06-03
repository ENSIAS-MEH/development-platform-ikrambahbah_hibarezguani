import { apiClient } from "./authService";


// ═══════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════

export const getConversations = () =>
  apiClient.get(`/api/conversations/me`);

export const getConversation = (id) =>
  apiClient.get(`/api/conversations/${id}`);

export const createConversation = (data) =>
  apiClient.post(`/api/conversations`, data);

// ═══════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════

export const getMessages = (conversationId) =>
  apiClient.get(`/api/messages/conversation/${conversationId}`);

export const sendMessage = (data) =>
  apiClient.post(`/api/messages`, data);

export const updateMessageStatus = (messageId, status) =>
  apiClient.patch(`/api/messages/${messageId}/status?status=${status}`);

export const markAsDelivered = (conversationId) =>
  apiClient.post(`/api/messages/conversation/${conversationId}/delivered`);

export const markAllAsDelivered = () =>
  apiClient.post(`/api/messages/delivered/all`);

export const markConversationAsRead = (conversationId) =>
  apiClient.post(`/api/messages/conversation/${conversationId}/read`);

export const markAsRead = (messageId) =>
  apiClient.post(`/api/messages/${messageId}/read`);

// ═══════════════════════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════════════════════

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(`/api/uploads`, formData, {
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
  apiClient.delete(`/api/messages/${messageId}`);