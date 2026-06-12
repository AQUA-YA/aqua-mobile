import { apiClient } from './client';
import type { ApiResponse } from '../types/api.types';

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    roles: string[];
    referralCode?: string;
  };
}

export const authApi = {
  register: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/register', { email }),

  verifyCode: (email: string, code: string) =>
    apiClient.post<ApiResponse<null>>('/auth/verify-code', { email, code }),

  setPassword: (email: string, code: string, password: string) =>
    apiClient.post<ApiResponse<RegisterResponse>>('/auth/set-password', {
      email,
      code,
      password,
    }),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<RegisterResponse>>('/auth/login', {
      email,
      password,
    }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<RegisterResponse>>('/auth/refresh', {
      refreshToken,
    }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', {
      email,
      code,
      newPassword,
    }),

  getMe: () => apiClient.get<ApiResponse<RegisterResponse['user']>>('/auth/me'),
};
