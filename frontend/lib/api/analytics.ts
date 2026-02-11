import { apiClient } from './client';
import { ApiResponse, DashboardStats, EmployeePerformance } from '@/types';

export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/analytics/dashboard'),

  getEmployeePerformance: () =>
    apiClient.get<ApiResponse<EmployeePerformance[]>>('/analytics/employee-performance'),

  getVisitsByDate: (startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<{ date: string; count: number }[]>>('/analytics/visits-by-date', {
      params: { startDate, endDate },
    }),

  getRequirements: () =>
    apiClient.get<ApiResponse<any>>('/analytics/requirements'),
};
