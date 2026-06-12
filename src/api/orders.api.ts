import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { Order } from '../types/models';

export interface CreateOrderRequest {
  mode: 'open' | 'to_purifier' | 'to_delivery';
  targetPurifierId?: string;
  targetDeliveryUserId?: string;
  waterTypeId: string;
  bottleSizeId: string;
  quantity: number;
  addressId?: string;
  deliveryAddress?: {
    street: string;
    neighborhood?: string;
    city: string;
    zipCode?: string;
    reference?: string;
    lat?: number;
    lng?: number;
  };
  tip?: number;
  paymentMethod: 'cash' | 'wallet';
  couponCode?: string;
  redeemPoints?: number;
  requiresEmptyPickup?: boolean;
}

export const ordersApi = {
  create: (data: CreateOrderRequest) =>
    apiClient.post<ApiResponse<Order>>('/orders', data),

  getMine: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<Paginated<Order>>('/orders/mine', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  cancel: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),

  getAvailable: (params?: { lat?: number; lng?: number; radiusKm?: number }) =>
    apiClient.get<ApiResponse<Order[]>>('/orders/available', { params }),

  accept: (id: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/accept`),

  assign: (id: string, deliveryUserId: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/assign`, {
      deliveryUserId,
    }),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status }),

  deliver: (id: string, emptyBottleReturned?: boolean) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/deliver`, {
      emptyBottleReturned,
    }),
};
