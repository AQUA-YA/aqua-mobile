import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type {
  DeliveryProfile,
  KycVerification,
  DeliveryInventory,
  DeliveryPrice,
  Order,
  QrToken,
} from '../types/models';

export const deliveryApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<DeliveryProfile>>('/delivery/me/profile'),

  updateProfile: (data: { hasOwnInventory?: boolean; deliveryFee?: number }) =>
    apiClient.patch<ApiResponse<DeliveryProfile>>(
      '/delivery/me/profile',
      data,
    ),

  updateAvailability: (isAvailable: boolean) =>
    apiClient.patch<ApiResponse<DeliveryProfile>>(
      '/delivery/me/availability',
      { isAvailable },
    ),

  getKyc: () =>
    apiClient.get<ApiResponse<KycVerification>>('/delivery/me/kyc'),

  submitKyc: (data: { idPhoto: string; selfie: string }) =>
    apiClient.post<ApiResponse<KycVerification>>('/delivery/me/kyc', data),

  getInventory: () =>
    apiClient.get<ApiResponse<DeliveryInventory[]>>('/delivery/me/inventory'),

  updateInventory: (items: DeliveryInventory[]) =>
    apiClient.put<ApiResponse<DeliveryInventory[]>>(
      '/delivery/me/inventory',
      { items },
    ),

  getPrices: () =>
    apiClient.get<ApiResponse<DeliveryPrice[]>>('/delivery/me/prices'),

  updatePrices: (items: DeliveryPrice[]) =>
    apiClient.put<ApiResponse<DeliveryPrice[]>>('/delivery/me/prices', {
      items,
    }),

  getQr: () =>
    apiClient.get<ApiResponse<QrToken>>('/delivery/me/qr'),

  getDeliveries: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<Order>>>('/delivery/me/deliveries', {
      params,
    }),

  verifyQr: (qrToken: string) =>
    apiClient.post<ApiResponse<{ deliveryUser: unknown }>>(
      '/delivery/verify-qr',
      { qrToken },
    ),
};
