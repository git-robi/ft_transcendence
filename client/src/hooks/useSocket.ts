import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api\/v1$/, '');

let socket: Socket | null = null;

export const useSocket = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    socket = io(SOCKET_URL, { withCredentials: true });

    socket.on('friend:online', ({ userId }: { userId: number }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    socket.on('friend:offline', ({ userId }: { userId: number }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const isOnline = useCallback((userId: number) => onlineUsers.has(userId), [onlineUsers]);

  return { onlineUsers, isOnline };
};
