import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../api/delivery.api';
import { ordersApi } from '../api/orders.api';

export function useDeliveryProfile() {
  return useQuery({
    queryKey: ['delivery', 'profile'],
    queryFn: () => deliveryApi.getProfile(),
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      deliveryApi.updateAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'profile'] });
    },
  });
}

export function useKyc() {
  return useQuery({
    queryKey: ['delivery', 'kyc'],
    queryFn: () => deliveryApi.getKyc(),
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { idPhoto: string; selfie: string }) =>
      deliveryApi.submitKyc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'kyc'] });
    },
  });
}

export function useDeliveryInventory() {
  return useQuery({
    queryKey: ['delivery', 'inventory'],
    queryFn: () => deliveryApi.getInventory(),
    enabled: false, // only when provider mode asks for it
  });
}

export function useAvailableOrders(params: {
  lat: number;
  lng: number;
  radiusKm?: number;
}) {
  return useQuery({
    queryKey: ['orders', 'available', params],
    queryFn: () => ordersApi.getAvailable(params),
    enabled: !!params.lat && !!params.lng,
    refetchInterval: 30000,
  });
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.accept(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'assigned'] });
    },
  });
}

export function useAssignedOrders() {
  return useQuery({
    queryKey: ['orders', 'assigned'],
    queryFn: () => ordersApi.getMine({ status: 'accepted' }),
  });
}

export function useDeliverOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      emptyBottleReturned,
    }: {
      orderId: string;
      emptyBottleReturned?: boolean;
    }) => ordersApi.deliver(orderId, emptyBottleReturned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', 'deliveries'] });
    },
  });
}

export function useDeliveryHistory() {
  return useQuery({
    queryKey: ['delivery', 'deliveries'],
    queryFn: () => deliveryApi.getDeliveries(),
  });
}

export function useDeliveryQr() {
  return useQuery({
    queryKey: ['delivery', 'qr'],
    queryFn: () => deliveryApi.getQr(),
  });
}
