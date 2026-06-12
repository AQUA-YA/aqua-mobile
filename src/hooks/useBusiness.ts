import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '../api/business.api';
import { masterDataApi } from '../api/masterData.api';

export function useInventory(purifierId: string) {
  return useQuery({
    queryKey: ['purifiers', purifierId, 'inventory'],
    queryFn: () => businessApi.getInventory(purifierId),
    enabled: !!purifierId,
  });
}

export function useCreateMovement(purifierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof businessApi.createMovement>[1]) =>
      businessApi.createMovement(purifierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purifiers', purifierId, 'inventory'] });
    },
  });
}

export function useStoreSales(
  purifierId: string,
  params?: { from?: string; to?: string },
) {
  return useQuery({
    queryKey: ['purifiers', purifierId, 'store-sales', params],
    queryFn: () => businessApi.getStoreSales(purifierId, params),
    enabled: !!purifierId,
  });
}

export function useCreateStoreSale(purifierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof businessApi.createStoreSale>[1]) =>
      businessApi.createStoreSale(purifierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purifiers', purifierId, 'store-sales'] });
    },
  });
}

export function useCashRegisters(purifierId: string) {
  return useQuery({
    queryKey: ['purifiers', purifierId, 'cash-registers'],
    queryFn: () => businessApi.getCashRegisters(purifierId),
    enabled: !!purifierId,
  });
}

export function useOpenCashRegister(purifierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { openingBalance: number }) =>
      businessApi.openCashRegister(purifierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purifiers', purifierId, 'cash-registers'] });
    },
  });
}

export function useCloseCashRegister(purifierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registerId: string) =>
      businessApi.closeCashRegister(purifierId, registerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purifiers', purifierId, 'cash-registers'] });
    },
  });
}

export function useDeliveryLinks(purifierId: string) {
  return useQuery({
    queryKey: ['purifiers', purifierId, 'delivery-links'],
    queryFn: () => businessApi.getDeliveryLinks(purifierId),
    enabled: !!purifierId,
  });
}

export function useCreateDeliveryLink(purifierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { deliveryUserId: string; shift?: 'morning' | 'afternoon' | 'full' }) =>
      businessApi.createDeliveryLink(purifierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purifiers', purifierId, 'delivery-links'] });
    },
  });
}

export function useMyCoupons() {
  return useQuery({
    queryKey: ['coupons', 'mine'],
    queryFn: () => businessApi.getMyCoupons(),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof businessApi.createCoupon>[0]) =>
      businessApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', 'mine'] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', 'mine'] });
    },
  });
}

export function useReports(
  purifierId: string,
  params?: { period?: 'daily' | 'weekly' | 'monthly'; from?: string; to?: string },
) {
  return useQuery({
    queryKey: ['purifiers', purifierId, 'reports', params],
    queryFn: () => businessApi.getReports(purifierId, params),
    enabled: !!purifierId,
  });
}

export function useWaterTypes() {
  return useQuery({
    queryKey: ['water-types'],
    queryFn: () => masterDataApi.getWaterTypes(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBottleSizes() {
  return useQuery({
    queryKey: ['bottle-sizes'],
    queryFn: () => masterDataApi.getBottleSizes(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyReferrals() {
  return useQuery({
    queryKey: ['referrals', 'me'],
    queryFn: () => businessApi.getMyReferrals(),
  });
}

export function useMyLoyalty() {
  return useQuery({
    queryKey: ['loyalty', 'me'],
    queryFn: () => businessApi.getMyLoyalty(),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: Parameters<typeof businessApi.validateCoupon>[0]) =>
      businessApi.validateCoupon(data),
  });
}
