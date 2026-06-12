import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/models';

export const usersApi = {
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: string;
    referralCode?: string;
  }) => apiClient.patch<ApiResponse<User>>('/users/me/profile', data),

  updateAvatar: (file: string) =>
    apiClient.patch<ApiResponse<User>>('/users/me/avatar', { file }),

  activatePurifierRole: () =>
    apiClient.post<ApiResponse<User>>('/users/me/roles/purifier'),

  activateDeliveryRole: () =>
    apiClient.post<ApiResponse<User>>('/users/me/roles/delivery'),
};
