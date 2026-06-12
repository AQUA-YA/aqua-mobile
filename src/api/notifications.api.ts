import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';

// TODO(api): Endpoints not yet available in backend.
// Register when FCM native module is installed and token is obtained.

export const notificationsApi = {
  registerToken: (data: { token: string; platform: 'ios' | 'android' }) =>
    apiClient.post<ApiResponse<null>>('/notifications/register', data),

  getPreferences: () =>
    apiClient.get<ApiResponse<{ pushEnabled: boolean; orderUpdates: boolean; promos: boolean }>>(
      '/notifications/preferences',
    ),

  updatePreferences: (data: { pushEnabled?: boolean; orderUpdates?: boolean; promos?: boolean }) =>
    apiClient.put<ApiResponse<null>>('/notifications/preferences', data),
};
