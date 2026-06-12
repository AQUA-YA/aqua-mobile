import { useMutation, useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getMine(),
  });
}

export function useDeposit() {
  return useMutation({
    mutationFn: (amount: number) => walletApi.deposit(amount),
  });
}

export function useWithdraw() {
  return useMutation({
    mutationFn: (amount: number) => walletApi.withdraw(amount),
  });
}

export function useTransactions(type?: string) {
  return useQuery({
    queryKey: ['wallet', 'transactions', type],
    queryFn: () => walletApi.getTransactions({ type, page: 1, limit: 50 }),
  });
}
