import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../api/socket';

interface UseOrderSocketOptions {
  orderId: string;
  onLocationUpdate?: (data: { orderId: string; lat: number; lng: number }) => void;
  onChatMessage?: (message: unknown) => void;
  onStatusChange?: (data: { status: string }) => void;
}

export function useOrderSocket({
  orderId,
  onLocationUpdate,
  onChatMessage,
  onStatusChange,
}: UseOrderSocketOptions) {
  const joinedRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !orderId) return;

    if (!joinedRef.current) {
      socket.emit('order.join', orderId);
      joinedRef.current = true;
    }

    if (onLocationUpdate) {
      socket.on('order.location', onLocationUpdate);
    }
    if (onChatMessage) {
      socket.on('chat.message', onChatMessage);
    }
    if (onStatusChange) {
      socket.on('order.status', onStatusChange);
    }

    return () => {
      if (onLocationUpdate) socket.off('order.location', onLocationUpdate);
      if (onChatMessage) socket.off('chat.message', onChatMessage);
      if (onStatusChange) socket.off('order.status', onStatusChange);

      if (joinedRef.current) {
        socket.emit('order.leave', orderId);
        joinedRef.current = false;
      }
    };
  }, [orderId, onLocationUpdate, onChatMessage, onStatusChange]);

  const updateLocation = useCallback(
    (lat: number, lng: number) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('order.location.update', { orderId, lat, lng });
      }
    },
    [orderId],
  );

  const sendChatMessage = useCallback(
    (content: string, messageType?: 'text' | 'location' | 'photo') => {
      const socket = getSocket();
      if (socket) {
        socket.emit('chat.send', { orderId, messageType, content });
      }
    },
    [orderId],
  );

  return { updateLocation, sendChatMessage };
}
