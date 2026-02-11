import { apiClient } from './client';
import { ApiResponse, AuthResponse, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string; role?: string; phone?: string }) =>
    apiClient.post<ApiResponse<User>>('/auth/register', data),

  getMe: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),
};
