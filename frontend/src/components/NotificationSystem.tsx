import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationStyle = (type: string) => {
    const baseStyle = {
      padding: '12px 16px',
      margin: '8px',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      maxWidth: '400px',
      wordBreak: 'break-word' as const
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          background: '#d4edda',
          color: '#155724',
          borderColor: '#c3e6cb'
        };
      case 'error':
        return {
          ...baseStyle,
          background: '#f8d7da',
          color: '#721c24',
          borderColor: '#f5c6cb'
        };
      case 'warning':
        return {
          ...baseStyle,
          background: '#fff3cd',
          color: '#856404',
          borderColor: '#ffeaa7'
        };
      case 'info':
        return {
          ...baseStyle,
          background: '#d1ecf1',
          color: '#0c5460',
          borderColor: '#bee5eb'
        };
      default:
        return {
          ...baseStyle,
          background: '#e2e3e5',
          color: '#383d41',
          borderColor: '#d6d8db'
        };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={getNotificationStyle(notification.type)}
          onClick={() => {
            markAsRead(notification.id);
            if (notification.action) {
              notification.action.onClick();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>
              {getNotificationIcon(notification.type)}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '4px',
                opacity: notification.read ? 0.7 : 1
              }}>
                {notification.title}
              </div>
              <div style={{ 
                fontSize: '13px',
                opacity: notification.read ? 0.7 : 1
              }}>
                {notification.message}
              </div>
              {notification.action && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.action!.onClick();
                    removeNotification(notification.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginTop: '4px',
                    padding: 0
                  }}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 4px',
                opacity: 0.7
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 