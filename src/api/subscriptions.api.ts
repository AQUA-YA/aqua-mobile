import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { Subscription } from '../types/models';

export interface CreateSubscriptionRequest {
  purifierId?: string;
  waterTypeId: string;
  bottleSizeId: string;
  quantity: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number;
  hour?: string;
  deliveryAddress?: Record<string, unknown>;
  paymentMethod?: 'cash' | 'wallet';
}

export const subscriptionsApi = {
  create: (data: CreateSubscriptionRequest) =>
    apiClient.post<ApiResponse<Subscription>>('/subscriptions', data),

  getMine: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<Subscription>>>('/subscriptions/mine', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`),

  update: (id: string, data: Partial<CreateSubscriptionRequest>) =>
    apiClient.patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, data),

  pause: (id: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`),

  resume: (id: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`),

  cancel: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/subscriptions/${id}`),

  getOrders: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<Subscription>>>(`/subscriptions/${id}/orders`, { params }),
};
