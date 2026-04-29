import { useState, useCallback } from 'react';
import axiosInstance from '@/api/axios';

/**
 * Hook for performing notification API calls.
 * This is used by the NotificationsProvider to manage state and logic.
 */
export const useNotificationsNetwork = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getMyNotifications = useCallback(async (params) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/notifications/my', { params });
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getUnreadCount = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/notifications/my/unread-count');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            const response = await axiosInstance.patch(`/notifications/${id}/read`);
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await axiosInstance.patch('/notifications/read-all');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const adminSendNotification = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post('/admin/notifications', data);
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const adminListAllNotifications = useCallback(async (params) => {
        try {
            const response = await axiosInstance.get('/admin/notifications', { params });
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    return {
        getMyNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        adminSendNotification,
        adminListAllNotifications,
        loading,
        error
    };
};

export default useNotificationsNetwork;
