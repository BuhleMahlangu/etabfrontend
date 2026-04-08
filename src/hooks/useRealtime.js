import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const { unreadNotifications, setUnreadNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);

  return {
    unreadCount: unreadNotifications,
    setUnreadCount: setUnreadNotifications,
    notifications,
    setNotifications,
  };
}

// Hook for real-time support messages
export function useRealtimeSupport() {
  const { unreadMessages, setUnreadMessages, on } = useSocket();
  const [messages, setMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    const unsubscribeNew = on('support:message', (data) => {
      setMessages(prev => [data.message, ...prev]);
      setLatestMessage(data.message);
    });

    const unsubscribeResponse = on('support:response', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, admin_response: data.response, status: data.status, responded_at: data.respondedAt }
            : msg
        )
      );
    });

    return () => {
      unsubscribeNew();
      unsubscribeResponse();
    };
  }, [on]);

  return {
    unreadCount: unreadMessages,
    setUnreadCount: setUnreadMessages,
    messages,
    setMessages,
    latestMessage,
  };
}

// Hook for real-time stats with auto-refresh fallback
export function useRealtimeStats(fetchFn, interval = 30000) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { isConnected } = useSocket();

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFn();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Set up polling as fallback when socket is not connected
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        refresh();
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, [refresh, isConnected, interval]);

  return { stats, loading, lastUpdated, refresh };
}

// Hook for live user presence (online/offline)
export function useUserPresence() {
  const { isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);

  return {
    isOnline: isConnected,
    onlineUsers,
    setOnlineUsers,
  };
}

// Hook for real-time alerts
export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState([]);
  const { on } = useSocket();

  const addAlert = useCallback((alert) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { ...alert, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = on('alert', (data) => {
      addAlert(data);
    });

    return () => unsubscribe();
  }, [on, addAlert]);

  return { alerts, addAlert, removeAlert };
}
