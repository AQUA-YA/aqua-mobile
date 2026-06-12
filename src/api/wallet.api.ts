import { apiClient } from './client';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { Wallet, Transaction } from '../types/models';

export const walletApi = {
  getMine: () => apiClient.get<ApiResponse<Wallet>>('/wallets/me'),

  deposit: (amount: number) =>
    apiClient.post<ApiResponse<{ transaction: Transaction; newBalance: number }>>(
      '/wallets/me/deposits',
      { amount },
    ),

  withdraw: (amount: number) =>
    apiClient.post<ApiResponse<{ transaction: Transaction; newBalance: number }>>(
      '/wallets/me/withdrawals',
      { amount },
    ),

  getTransactions: (params?: {
    type?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get<ApiResponse<Paginated<Transaction>>>(
      '/wallets/me/transactions',
      { params },
    ),
};
