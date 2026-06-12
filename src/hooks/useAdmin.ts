import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useAdminUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { roles?: string[]; isSuspended?: boolean } }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useKycVerifications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'kyc', params],
    queryFn: () => adminApi.getKycVerifications(params),
  });
}

export function useReviewKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: 'approved' | 'rejected'; rejectionReason?: string };
    }) => adminApi.reviewKyc(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
    },
  });
}

export function useAdminOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminApi.getOrders(params),
  });
}

export function useAdminWaterTypes(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'water-types', params],
    queryFn: () => adminApi.getWaterTypes(params),
  });
}

export function useCreateWaterType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; isActive?: boolean }) =>
      adminApi.createWaterType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'water-types'] });
    },
  });
}

export function useUpdateWaterType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string; isActive?: boolean };
    }) => adminApi.updateWaterType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'water-types'] });
    },
  });
}

export function useDeleteWaterType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteWaterType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'water-types'] });
    },
  });
}

export function useAdminBottleSizes(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'bottle-sizes', params],
    queryFn: () => adminApi.getBottleSizes(params),
  });
}

export function useCreateBottleSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { liters: number; name?: string; isActive?: boolean }) =>
      adminApi.createBottleSize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bottle-sizes'] });
    },
  });
}

export function useUpdateBottleSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { liters?: number; name?: string; isActive?: boolean };
    }) => adminApi.updateBottleSize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bottle-sizes'] });
    },
  });
}

export function useDeleteBottleSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteBottleSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bottle-sizes'] });
    },
  });
}

export function useAdminCommissionConfig() {
  return useQuery({
    queryKey: ['admin', 'commission-config'],
    queryFn: () => adminApi.getCommissionConfig(),
  });
}

export function useUpdateCommissionConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: 'fixed' | 'percentage' | 'disabled'; value: number }) =>
      adminApi.updateCommissionConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'commission-config'] });
    },
  });
}

export function useAdminCoupons(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'coupons', params],
    queryFn: () => adminApi.getCoupons(params),
  });
}

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminApi.createCoupon>[0]) =>
      adminApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useUpdateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateCoupon>[1] }) =>
      adminApi.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useDeleteAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useAdminLoyaltyEvents(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'loyalty-events', params],
    queryFn: () => adminApi.getLoyaltyEvents(params),
  });
}

export function useCreateAdminLoyaltyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof adminApi.createLoyaltyEvent>[0]) =>
      adminApi.createLoyaltyEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loyalty-events'] });
    },
  });
}

export function useDeleteAdminLoyaltyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteLoyaltyEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loyalty-events'] });
    },
  });
}

export function useAdminSupportTickets(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'support-tickets', params],
    queryFn: () => adminApi.getSupportTickets(params),
  });
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status?: 'open' | 'in_progress' | 'closed'; adminResponse?: string };
    }) => adminApi.updateSupportTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] });
    },
  });
}

export function useDashboardMetrics(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'metrics', params],
    queryFn: () => adminApi.getDashboardMetrics(params),
  });
}

export function useDashboardHeatmap(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'heatmap', params],
    queryFn: () => adminApi.getDashboardHeatmap(params),
  });
}

export function useAdminReport(type: 'users' | 'orders' | 'sales' | 'commissions') {
  return useQuery({
    queryKey: ['admin', 'reports', type],
    queryFn: () => adminApi.getReport(type),
    enabled: false,
  });
}
