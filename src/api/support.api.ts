import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { SupportTicket } from '../types/models';

export const supportApi = {
  create: (data: { orderId?: string; subject: string; description: string; attachments?: string[] }) =>
    apiClient.post<ApiResponse<SupportTicket>>('/support-tickets', data),

  getMine: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<SupportTicket>>>('/support-tickets/mine', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<SupportTicket>>(`/support-tickets/${id}`),
};
