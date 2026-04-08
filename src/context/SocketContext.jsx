import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/Toast';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 [SOCKET] Connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 [SOCKET] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 [SOCKET] Connection error:', error.message);
    });

    // Listen for new notifications
    newSocket.on('notification:new', (data) => {
      console.log('🔔 [SOCKET] New notification:', data);
      setUnreadNotifications(data.unreadCount);
      
      // Show toast for new notification
      if (data.notification) {
        addToast(data.notification.title, 'info');
      }
    });

    // Listen for notification read updates
    newSocket.on('notification:read', (data) => {
      setUnreadNotifications(data.unreadCount);
    });

    // Listen for support messages
    newSocket.on('support:message', (data) => {
      console.log('📨 [SOCKET] New support message:', data);
      setUnreadMessages(prev => prev + 1);
      addToast('New support message received', 'info');
    });

    // Listen for super admin messages
    newSocket.on('support:super_admin_message', (data) => {
      console.log('📨 [SOCKET] Super admin message:', data);
      addToast('School admin needs help', 'warning');
    });

    // Listen for support responses
    newSocket.on('support:response', (data) => {
      console.log('📨 [SOCKET] Support response:', data);
      addToast('Your message has been responded to', 'success');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user, addToast]);

  // Emit event helper
  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  // Listen to event helper
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  }, [socket]);

  const value = {
    socket,
    isConnected,
    emit,
    on,
    unreadNotifications,
    unreadMessages,
    setUnreadNotifications,
    setUnreadMessages,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
