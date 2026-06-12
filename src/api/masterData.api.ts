import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { WaterType, BottleSize } from '../types/models';

export const masterDataApi = {
  getWaterTypes: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<WaterType>>>('/water-types', { params }),

  getBottleSizes: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<BottleSize>>>('/bottle-sizes', { params }),
};
