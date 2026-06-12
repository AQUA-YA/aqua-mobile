import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type {
  InventoryItem,
  InventoryMovement,
  StoreSale,
  CashRegister,
  CashEntry,
  Coupon,
  CouponValidation,
  DeliveryLink,
  LoyaltyEvent,
  LoyaltyInfo,
  ReferralInfo,
} from '../types/models';

export const businessApi = {
  getInventory: (purifierId: string) =>
    apiClient.get<ApiResponse<InventoryItem[]>>(
      `/purifiers/${purifierId}/inventory`,
    ),

  updateInventory: (
    purifierId: string,
    items: Array<{
      bottleSizeId: string;
      availableQuantity: number;
      availableSeals: number;
      lowStockThreshold?: number;
    }>,
  ) =>
    apiClient.put<ApiResponse<InventoryItem[]>>(
      `/purifiers/${purifierId}/inventory`,
      items,
    ),

  createMovement: (
    purifierId: string,
    data: {
      bottleSizeId: string;
      type: 'in' | 'out' | 'adjustment';
      quantity: number;
      seals?: number;
      reason: string;
    },
  ) =>
    apiClient.post<ApiResponse<InventoryMovement>>(
      `/purifiers/${purifierId}/inventory/movements`,
      data,
    ),

  getMovements: (purifierId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<InventoryMovement>>>(
      `/purifiers/${purifierId}/inventory/movements`,
      { params },
    ),

  createStoreSale: (
    purifierId: string,
    data: {
      waterTypeId: string;
      bottleSizeId: string;
      quantity: number;
      total: number;
      paymentMethod: 'cash' | 'wallet' | 'transfer';
    },
  ) =>
    apiClient.post<ApiResponse<StoreSale>>(
      `/purifiers/${purifierId}/store-sales`,
      data,
    ),

  getStoreSales: (
    purifierId: string,
    params?: { from?: string; to?: string; page?: number; limit?: number },
  ) =>
    apiClient.get<ApiResponse<Paginated<StoreSale>>>(
      `/purifiers/${purifierId}/store-sales`,
      { params },
    ),

  openCashRegister: (
    purifierId: string,
    data: { date?: string; openingBalance: number },
  ) =>
    apiClient.post<ApiResponse<CashRegister>>(
      `/purifiers/${purifierId}/cash-registers`,
      data,
    ),

  addCashEntry: (
    purifierId: string,
    registerId: string,
    data: { type: 'income' | 'expense'; concept: string; amount: number },
  ) =>
    apiClient.post<ApiResponse<CashEntry>>(
      `/purifiers/${purifierId}/cash-registers/${registerId}/entries`,
      data,
    ),

  closeCashRegister: (purifierId: string, registerId: string) =>
    apiClient.post<ApiResponse<CashRegister>>(
      `/purifiers/${purifierId}/cash-registers/${registerId}/close`,
    ),

  getCashRegisters: (purifierId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<CashRegister>>>(
      `/purifiers/${purifierId}/cash-registers`,
      { params },
    ),

  getReports: (
    purifierId: string,
    params?: {
      period?: 'daily' | 'weekly' | 'monthly';
      from?: string;
      to?: string;
      format?: 'json' | 'csv';
    },
  ) =>
    apiClient.get<ApiResponse<unknown[]>>(
      `/purifiers/${purifierId}/reports/sales`,
      { params },
    ),

  getDeliveryLinks: (purifierId: string) =>
    apiClient.get<ApiResponse<DeliveryLink[]>>(
      `/purifiers/${purifierId}/delivery-links`,
    ),

  createDeliveryLink: (
    purifierId: string,
    data: { deliveryUserId: string; shift?: 'morning' | 'afternoon' | 'full' },
  ) =>
    apiClient.post<ApiResponse<DeliveryLink>>(
      `/purifiers/${purifierId}/delivery-links`,
      data,
    ),

  deleteDeliveryLink: (purifierId: string, linkId: string) =>
    apiClient.delete<ApiResponse<null>>(
      `/purifiers/${purifierId}/delivery-links/${linkId}`,
    ),

  getMyCoupons: () => apiClient.get<ApiResponse<Coupon[]>>('/coupons/mine'),

  createCoupon: (data: {
    code?: string;
    type: 'amount' | 'percentage' | 'two_for_one' | 'free_delivery';
    value: number;
    purifierId?: string;
    maxUses?: number;
    maxUsesPerUser?: number;
    startsAt: string;
    endsAt: string;
  }) => apiClient.post<ApiResponse<Coupon>>('/coupons', data),

  deleteCoupon: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(`/coupons/${id}`),

  validateCoupon: (data: {
    code: string;
    purifierId?: string;
    subtotal: number;
    deliveryFee: number;
  }) => apiClient.post<ApiResponse<CouponValidation>>('/coupons/validate', data),

  createLoyaltyEvent: (data: {
    name: string;
    multiplier: number;
    waterTypeId?: string;
    purifierId?: string;
    startsAt: string;
    endsAt: string;
  }) => apiClient.post<ApiResponse<LoyaltyEvent>>('/loyalty/events', data),

  getLoyaltyEvents: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Paginated<LoyaltyEvent>>>('/loyalty/events', {
      params,
    }),

  deleteLoyaltyEvent: (id: string) =>
    apiClient.delete<ApiResponse<{ deletedAt: string }>>(
      `/loyalty/events/${id}`,
    ),

  getMyLoyalty: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<LoyaltyInfo>>('/loyalty/me', { params }),

  getMyReferrals: () =>
    apiClient.get<ApiResponse<ReferralInfo>>('/referrals/me'),
};
