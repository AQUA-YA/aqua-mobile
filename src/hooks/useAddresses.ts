import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from '../api/addresses.api';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
