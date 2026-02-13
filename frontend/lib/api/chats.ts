import { apiClient } from './client';
import { ApiResponse, PaginatedData, ChatListItem, ChatMessage, ChatUser, ChatDetail, GroupDetail, FileUploadResponse, MessageType } from '@/types';

export const chatsApi = {
  getChats: () =>
    apiClient.get<ApiResponse<ChatListItem[]>>('/chats'),

  createChat: (data: { participantId: string } | { isGroup: true; name: string; participantIds: string[] }) =>
    apiClient.post<ApiResponse<ChatDetail>>('/chats', data),

  getMessages: (chatId: string, params?: { page?: number; perPage?: number }) =>
    apiClient.get<ApiResponse<PaginatedData<ChatMessage>>>(`/chats/${chatId}/messages`, { params }),

  sendMessage: (chatId: string, data: {
    content?: string;
    messageType?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) =>
    apiClient.post<ApiResponse<ChatMessage>>(`/chats/${chatId}/messages`, data),

  uploadFile: (chatId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<FileUploadResponse>>(
      `/chats/${chatId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  markAsRead: (chatId: string) =>
    apiClient.put<ApiResponse<void>>(`/chats/${chatId}/read`),

  getUsers: () =>
    apiClient.get<ApiResponse<ChatUser[]>>('/chats/users/list'),

  getGroupDetails: (chatId: string) =>
    apiClient.get<ApiResponse<GroupDetail>>(`/chats/${chatId}/details`),

  addParticipant: (chatId: string, userId: string) =>
    apiClient.post<ApiResponse<any>>(`/chats/${chatId}/participants`, { userId }),

  removeParticipant: (chatId: string, userId: string) =>
    apiClient.delete<ApiResponse<void>>(`/chats/${chatId}/participants/${userId}`),
};
