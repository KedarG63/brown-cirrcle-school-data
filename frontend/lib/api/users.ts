import { apiClient } from './client';
import { ApiResponse, PaginatedData, User } from '@/types';

export const usersApi = {
  getAll: (params?: { page?: number; perPage?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedData<User>>>('/users', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data),

  toggleActive: (id: string) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}/toggle`),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/users/${id}`),
};
