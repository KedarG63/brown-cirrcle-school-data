import { apiClient } from './client';
import { ApiResponse, PaginatedData, School } from '@/types';

export const schoolsApi = {
  getAll: (params?: { page?: number; perPage?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedData<School>>>('/schools', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<School>>(`/schools/${id}`),

  create: (data: Partial<School>) =>
    apiClient.post<ApiResponse<School>>('/schools', data),

  update: (id: string, data: Partial<School>) =>
    apiClient.put<ApiResponse<School>>(`/schools/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/schools/${id}`),
};
