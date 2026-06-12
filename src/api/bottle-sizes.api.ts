import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { BottleSize } from '../types/models';

export const bottleSizesApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<BottleSize>>>('/bottle-sizes', {
      params,
    }),
};
