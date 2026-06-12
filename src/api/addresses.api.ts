import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';
import type { Address } from '../types/models';

export const addressesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Address[]>>('/users/me/addresses'),

  create: (data: {
    alias: string;
    street: string;
    neighborhood?: string;
    city: string;
    zipCode?: string;
    reference?: string;
    location?: { lat: number; lng: number };
    isPrimary?: boolean;
  }) => apiClient.post<ApiResponse<Address>>('/users/me/addresses', data),

  update: (
    id: string,
    data: Partial<{
      alias: string;
      street: string;
      neighborhood: string;
      city: string;
      zipCode: string;
      reference: string;
      location: { lat: number; lng: number };
      isPrimary: boolean;
    }>,
  ) => apiClient.patch<ApiResponse<Address>>(`/users/me/addresses/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/users/me/addresses/${id}`),
};
