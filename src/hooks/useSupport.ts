import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../api/support.api';

export function useMyTickets(status?: string) {
  return useQuery({
    queryKey: ['support-tickets', 'mine', status],
    queryFn: () => supportApi.getMine({ status }),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof supportApi.create>[0]) => supportApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets', 'mine'] });
    },
  });
}
