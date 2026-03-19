import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

function getSocketUrl(): string {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/v1$/, '');
  return base || window.location.origin;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<number>;
  isOnline: (userId: number) => boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;

    const url = getSocketUrl();
    const s: Socket = io(url, { withCredentials: true, transports: ['websocket'] });
    setSocket(s);

    s.on('connect', () => {});

    s.on('connect_error', () => {});

    s.on('disconnect', () => {});

    s.on('friends:online-list', (ids: number[]) => {
      setOnlineUsers(new Set(ids));
    });

    s.on('friend:online', ({ userId }: { userId: number }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    s.on('friend:offline', ({ userId }: { userId: number }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  const isOnline = useCallback((userId: number) => onlineUsers.has(userId), [onlineUsers]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
