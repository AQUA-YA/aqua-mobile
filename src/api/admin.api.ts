import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type {
  User,
  KycVerification,
  Order,
  WaterType,
  BottleSize,
  CommissionConfig,
  CommissionConfigHistory,
  Coupon,
  LoyaltyEvent,
  SupportTicket,
  DashboardMetrics,
  HeatmapPoint,
} from '../types/models';

export const adminApi = {
  getUsers: (params?: {
    search?: string;
    page?: number;
    limit?: number;
    role?: string;
  }) => apiClient.get<Paginated<User>>('/users', { params }),

  getUser: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`),

  updateUser: (id: string, data: { roles?: string[]; isSuspended?: boolean }) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, data),

  deleteUser: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/users/${id}`),

  restoreUser: (id: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/restore`),

  getKycVerifications: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<Paginated<KycVerification>>('/kyc-verifications', { params }),

  reviewKyc: (id: string, data: { status: 'approved' | 'rejected'; rejectionReason?: string }) =>
    apiClient.patch<ApiResponse<KycVerification>>(`/kyc-verifications/${id}`, data),

  getOrders: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<Paginated<Order>>('/orders', { params }),

  getWaterTypes: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<Paginated<WaterType>>('/water-types', { params }),

  createWaterType: (data: { name: string; description?: string; isActive?: boolean }) =>
    apiClient.post<ApiResponse<WaterType>>('/water-types', data),

  updateWaterType: (id: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    apiClient.patch<ApiResponse<WaterType>>(`/water-types/${id}`, data),

  deleteWaterType: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/water-types/${id}`),

  getBottleSizes: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<Paginated<BottleSize>>('/bottle-sizes', { params }),

  createBottleSize: (data: { liters: number; name?: string; isActive?: boolean }) =>
    apiClient.post<ApiResponse<BottleSize>>('/bottle-sizes', data),

  updateBottleSize: (id: string, data: { liters?: number; name?: string; isActive?: boolean }) =>
    apiClient.patch<ApiResponse<BottleSize>>(`/bottle-sizes/${id}`, data),

  deleteBottleSize: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/bottle-sizes/${id}`),

  getCommissionConfig: () =>
    apiClient.get<ApiResponse<CommissionConfig>>('/commission-config'),

  updateCommissionConfig: (data: { type: 'fixed' | 'percentage' | 'disabled'; value: number }) =>
    apiClient.put<ApiResponse<CommissionConfig>>('/commission-config', data),

  getCommissionHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<CommissionConfigHistory>>>('/commission-config/history', { params }),

  getCoupons: (params?: { page?: number; limit?: number }) =>
    apiClient.get<Paginated<Coupon>>('/coupons', { params }),

  createCoupon: (data: {
    code?: string;
    type: 'amount' | 'percentage' | 'two_for_one' | 'free_delivery';
    value: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    startsAt: string;
    endsAt: string;
    isWelcome?: boolean;
  }) => apiClient.post<ApiResponse<Coupon>>('/coupons', data),

  updateCoupon: (id: string, data: Partial<{
    type: string;
    value: number;
    maxUses: number;
    maxUsesPerUser: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
  }>) => apiClient.patch<ApiResponse<Coupon>>(`/coupons/${id}`, data),

  deleteCoupon: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/coupons/${id}`),

  getLoyaltyEvents: (params?: { page?: number; limit?: number }) =>
    apiClient.get<Paginated<LoyaltyEvent>>('/loyalty/events', { params }),

  createLoyaltyEvent: (data: {
    name: string;
    multiplier: number;
    waterTypeId?: string;
    startsAt: string;
    endsAt: string;
    isActive?: boolean;
  }) => apiClient.post<ApiResponse<LoyaltyEvent>>('/loyalty/events', data),

  updateLoyaltyEvent: (id: string, data: Partial<{
    name: string;
    multiplier: number;
    waterTypeId: string;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
  }>) => apiClient.patch<ApiResponse<LoyaltyEvent>>(`/loyalty/events/${id}`, data),

  deleteLoyaltyEvent: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/loyalty/events/${id}`),

  getSupportTickets: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<Paginated<SupportTicket>>('/support-tickets', { params }),

  updateSupportTicket: (id: string, data: {
    status?: 'open' | 'in_progress' | 'closed';
    adminResponse?: string;
  }) => apiClient.patch<ApiResponse<SupportTicket>>(`/support-tickets/${id}`, data),

  getDashboardMetrics: (params?: { from?: string; to?: string }) =>
    apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics', { params }),

  getDashboardHeatmap: (params?: { from?: string; to?: string }) =>
    apiClient.get<ApiResponse<HeatmapPoint[]>>('/dashboard/heatmap', { params }),

  getReport: (type: 'users' | 'orders' | 'sales' | 'commissions') =>
    apiClient.get<string>(`/admin/reports/${type}`, {
      params: { format: 'csv' },
      responseType: 'text',
    }),
};
