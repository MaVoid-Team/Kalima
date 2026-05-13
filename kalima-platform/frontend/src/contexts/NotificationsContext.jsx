import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import socket, { connectSocket, disconnectSocket } from '@/api/socket';
import { useNotificationsNetwork } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import useAuth from '@/hooks/auth/useAuth';
import { useRole } from '@/hooks/useRole';

export const NotificationsContext = createContext();

export const NOTIFICATION_CATEGORIES = {
    ORDER_STATUS_CHANGE: 1,
    ORDER_ITEM_DELETED: 2,
    ORDER_DELETED: 3,
    NEW_ORDER: 4,
    NEW_ACCOUNT: 5,
    ORDER_GENERAL_EDIT: 7,
    SYSTEM_ANNOUNCEMENT: 8,
    ACCOUNT_UPDATE: 9,
    CUSTOM: 10
};

export const CATEGORY_COLORS = {
    1: '#3b82f6', // blue (Order Status)
    2: '#f59e0b', // amber (Item Deleted)
    3: '#ef4444', // red (Order Deleted)
    4: '#10b981', // emerald (New Order - Admin)
    5: '#6366f1', // indigo (New Account - Admin)
    7: '#8b5cf6', // violet (General Edit)
    8: '#ec4899', // pink (Announcement)
    9: '#14b8a6', // teal (Account Update)
    10: '#64748b' // slate (Custom)
};

export const NotificationsProvider = ({ children }) => {
    const { t } = useTranslation('notifications');
    const { isAuthenticated } = useAuth();
    const { hasAdminAccess, isTeacher } = useRole();
    
    const {
        getMyNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        adminSendNotification,
        adminListAllNotifications,
        loading: apiLoading,
        error
    } = useNotificationsNetwork();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const isFirstLoad = useRef(true);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await getUnreadCount();
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [isAuthenticated, getUnreadCount]);

    const fetchInitialNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const { data } = await getMyNotifications({ is_read: false, limit: 20 });
            const nextNotifications = data.notifications || [];
            setNotifications(nextNotifications);
            if (nextNotifications.some((notification) => notification.entity_type === 'purchase')) {
                window.dispatchEvent(new CustomEvent('kalima:orders-changed'));
            }
            await fetchUnreadCount();
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, fetchUnreadCount, getMyNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications([]);
            setUnreadCount(0);
            toast.success(t('marked_all_read', 'All notifications marked as read'));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            connectSocket();
            
            if (isFirstLoad.current) {
                fetchInitialNotifications();
                isFirstLoad.current = false;
            }

            const onNotification = (notification) => {
                console.log('Received notification:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                if (notification.entity_type === 'purchase') {
                    window.dispatchEvent(new CustomEvent('kalima:orders-changed', { detail: notification }));
                }
                
                // Show toast
                const messageKey = notification.message_key;
                const message = t(`keys.${messageKey}`, messageKey);
                const purchaseTarget = hasAdminAccess
                    ? `/admin/orders/${notification.entity_id}`
                    : isTeacher
                        ? '/teacher/orders'
                        : '/orders';
                
                toast(message, {
                    description: t('new_notification', 'You have a new notification'),
                    icon: '🔔',
                    action: notification.entity_type === 'purchase' ? {
                        label: t('view', 'View'),
                        onClick: () => window.location.href = purchaseTarget
                    } : undefined
                });
            };

            const onConnect = () => {
                if (hasAdminAccess) {
                    socket.emit('join', 'store_admins');
                }
                fetchInitialNotifications();
            };

            socket.on('notification', onNotification);
            socket.on('connect', onConnect);

            if (socket.connected) {
                onConnect();
            }

            return () => {
                socket.off('notification', onNotification);
                socket.off('connect', onConnect);
            };
        } else {
            disconnectSocket();
            setNotifications([]);
            setUnreadCount(0);
            isFirstLoad.current = true;
        }
    }, [isAuthenticated, hasAdminAccess, isTeacher, t, fetchInitialNotifications]);

    const value = {
        notifications,
        unreadCount,
        loading: loading || apiLoading,
        error,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        refresh: fetchInitialNotifications,
        adminSendNotification,
        adminListAllNotifications,
        getMyNotifications
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};

