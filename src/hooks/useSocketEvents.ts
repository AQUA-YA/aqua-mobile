import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../api/socket';
import { useAuthStore } from '../store/authStore';

export function useSocketConnection() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      if (connectedRef.current) {
        disconnectSocket();
        connectedRef.current = false;
      }
      return;
    }

    const socket = connectSocket();
    connectedRef.current = true;

    const handleOrderNew = () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
    };

    const handleOrderStatus = (data: { orderId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'assigned'] });
    };

    const handleOrderCancelled = (data: { orderId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
    };

    const handleOrderAssigned = (data: { orderId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', data.orderId] });
    };

    const handleOrderUpdated = (data: { orderId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', data.orderId] });
    };

    const handleKycStatus = () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'kyc'] });
    };

    socket.on('order.new', handleOrderNew);
    socket.on('order.status', handleOrderStatus);
    socket.on('order.cancelled', handleOrderCancelled);
    socket.on('order.assigned', handleOrderAssigned);
    socket.on('order.updated', handleOrderUpdated);
    socket.on('kyc.status', handleKycStatus);

    return () => {
      socket.off('order.new', handleOrderNew);
      socket.off('order.status', handleOrderStatus);
      socket.off('order.cancelled', handleOrderCancelled);
      socket.off('order.assigned', handleOrderAssigned);
      socket.off('order.updated', handleOrderUpdated);
      socket.off('kyc.status', handleKycStatus);
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [accessToken, queryClient]);
}
