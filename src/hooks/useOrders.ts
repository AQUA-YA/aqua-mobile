import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import type { CreateOrderRequest } from '../api/orders.api';

export function useMyOrders(status?: string) {
  return useInfiniteQuery({
    queryKey: ['orders', 'mine', status],
    queryFn: ({ pageParam }) =>
      ordersApi.getMine({ status, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((p) => p.data.data),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.data.data.status;
      if (
        status === 'pending' ||
        status === 'accepted' ||
        status === 'in_transit'
      ) {
        return 15000;
      }
      return false;
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersApi.cancel(id, reason),
  });
}
