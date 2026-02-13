'use client';

import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { MessageType } from '@/types';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function useSocket() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('accessToken');
    if (!token || socket) return;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }, [isAuthenticated]);

  const sendMessage = useCallback((chatId: string, data: string | {
    content?: string;
    messageType?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) => {
    if (typeof data === 'string') {
      socket?.emit('send_message', { chatId, content: data });
    } else {
      socket?.emit('send_message', { chatId, ...data });
    }
  }, []);

  const joinChat = useCallback((chatId: string) => {
    socket?.emit('join_chat', chatId);
  }, []);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    if (!socket) return () => {};
    socket.on('new_message', callback);
    return () => {
      socket?.off('new_message', callback);
    };
  }, []);

  const onUnreadUpdated = useCallback((callback: (data: { chatId: string; unreadCount: number }) => void) => {
    if (!socket) return () => {};
    socket.on('unread_updated', callback);
    return () => {
      socket?.off('unread_updated', callback);
    };
  }, []);

  const onGroupUpdated = useCallback((callback: (data: { chatId: string; action: string; userId?: string }) => void) => {
    if (!socket) return () => {};
    socket.on('group_updated', callback);
    return () => {
      socket?.off('group_updated', callback);
    };
  }, []);

  return { socket, sendMessage, joinChat, onNewMessage, onUnreadUpdated, onGroupUpdated };
}
