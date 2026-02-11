import { apiClient } from './client';
import { ApiResponse, PaginatedData, SchoolVisit } from '@/types';

export const visitsApi = {
  getAll: (params?: {
    page?: number;
    perPage?: number;
    employeeId?: string;
    schoolId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get<ApiResponse<PaginatedData<SchoolVisit>>>('/visits', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<SchoolVisit>>(`/visits/${id}`),

  create: (data: any) =>
    apiClient.post<ApiResponse<SchoolVisit>>('/visits', data),

  update: (id: string, data: any) =>
    apiClient.put<ApiResponse<SchoolVisit>>(`/visits/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/visits/${id}`),

  uploadImages: (visitId: string, formData: FormData) =>
    apiClient.post<ApiResponse<{ count: number }>>(`/visits/${visitId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteImage: (imageId: string) =>
    apiClient.delete<ApiResponse<void>>(`/visits/images/${imageId}`),
};
