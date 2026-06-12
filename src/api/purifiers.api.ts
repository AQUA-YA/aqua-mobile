import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { Purifier, PurifierPrice, Rating } from '../types/models';

export const purifiersApi = {
  getNearby: (params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    waterTypeId?: string;
    bottleSizeId?: string;
    search?: string;
  }) =>
    apiClient.get<ApiResponse<Array<Purifier & { distance?: number }>>>(
      '/purifiers/nearby',
      { params },
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Purifier>>(`/purifiers/${id}`),

  getPrices: (id: string) =>
    apiClient.get<ApiResponse<PurifierPrice[]>>(`/purifiers/${id}/prices`),

  getRatings: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<Rating>>>(
      `/purifiers/${id}/ratings`,
      { params },
    ),

  createRating: (
    purifierId: string,
    data: { orderId: string; score: number; comment?: string },
  ) =>
    apiClient.post<ApiResponse<Rating>>(`/purifiers/${purifierId}/ratings`, data),

  getMine: () =>
    apiClient.get<ApiResponse<Purifier[]>>('/purifiers/mine'),

  create: (data: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    schedule?: string;
    phone?: string;
    photos?: string[];
    description?: string;
    waterTypeIds?: string[];
    bottleSizeIds?: string[];
    deliveryFee?: number;
  }) => apiClient.post<ApiResponse<Purifier>>('/purifiers', data),

  update: (id: string, data: Partial<Purifier>) =>
    apiClient.patch<ApiResponse<Purifier>>(`/purifiers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/purifiers/${id}`),

  upsertPrices: (id: string, prices: PurifierPrice[]) =>
    apiClient.put<ApiResponse<PurifierPrice[]>>(`/purifiers/${id}/prices`, {
      prices,
    }),
};
