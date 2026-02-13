import { apiClient } from './client';
import { ApiResponse, PaginatedData, Note, NoteLabel, NoteChecklistItem, NoteColor } from '@/types';

export const notesApi = {
  getAll: (params?: {
    page?: number;
    perPage?: number;
    type?: string;
    color?: string;
    labelId?: string;
    pinned?: boolean;
    archived?: boolean;
    trashed?: boolean;
    schoolId?: string;
    visitId?: string;
    search?: string;
  }) => apiClient.get<ApiResponse<PaginatedData<Note>>>('/notes', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Note>>(`/notes/${id}`),

  create: (data: {
    title?: string;
    content?: string;
    noteType?: string;
    color?: string;
    schoolId?: string;
    visitId?: string;
    checklistItems?: { text: string; isCompleted?: boolean; position?: number }[];
  }) => apiClient.post<ApiResponse<Note>>('/notes', data),

  update: (id: string, data: {
    title?: string | null;
    content?: string | null;
    noteType?: string;
    color?: string;
    schoolId?: string | null;
    visitId?: string | null;
  }) => apiClient.put<ApiResponse<Note>>(`/notes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/notes/${id}`),

  togglePin: (id: string) =>
    apiClient.put<ApiResponse<Note>>(`/notes/${id}/pin`),

  toggleArchive: (id: string) =>
    apiClient.put<ApiResponse<Note>>(`/notes/${id}/archive`),

  moveToTrash: (id: string) =>
    apiClient.put<ApiResponse<void>>(`/notes/${id}/trash`),

  restoreFromTrash: (id: string) =>
    apiClient.put<ApiResponse<Note>>(`/notes/${id}/restore`),

  updateColor: (id: string, color: NoteColor) =>
    apiClient.put<ApiResponse<Note>>(`/notes/${id}/color`, { color }),

  // Checklist items
  addChecklistItem: (noteId: string, data: { text: string; position?: number }) =>
    apiClient.post<ApiResponse<NoteChecklistItem>>(`/notes/${noteId}/checklist-items`, data),

  updateChecklistItem: (noteId: string, itemId: string, data: { text?: string; isCompleted?: boolean; position?: number }) =>
    apiClient.put<ApiResponse<NoteChecklistItem>>(`/notes/${noteId}/checklist-items/${itemId}`, data),

  deleteChecklistItem: (noteId: string, itemId: string) =>
    apiClient.delete<ApiResponse<void>>(`/notes/${noteId}/checklist-items/${itemId}`),

  // Labels
  getLabels: () =>
    apiClient.get<ApiResponse<NoteLabel[]>>('/notes/labels'),

  createLabel: (data: { name: string; color?: string }) =>
    apiClient.post<ApiResponse<NoteLabel>>('/notes/labels', data),

  updateLabel: (id: string, data: { name?: string; color?: string }) =>
    apiClient.put<ApiResponse<NoteLabel>>(`/notes/labels/${id}`, data),

  deleteLabel: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/notes/labels/${id}`),

  addLabelToNote: (noteId: string, labelId: string) =>
    apiClient.post<ApiResponse<any>>(`/notes/${noteId}/labels/${labelId}`),

  removeLabelFromNote: (noteId: string, labelId: string) =>
    apiClient.delete<ApiResponse<void>>(`/notes/${noteId}/labels/${labelId}`),
};
