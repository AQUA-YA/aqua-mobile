import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { WaterType } from '../types/models';

export const waterTypesApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<WaterType>>>('/water-types', {
      params,
    }),
};
