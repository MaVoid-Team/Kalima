import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import socket, { connectSocket, disconnectSocket } from '@/api/socket';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';

export const useWhatsappStatus = () => {
    const { t } = useTranslation('admin');
    const [status, setStatus] = useState('disconnected'); // 'disconnected' | 'qr_pending' | 'ready' | 'failed'
    const [qrCodeStr, setQrCodeStr] = useState(null);
    const [sendingNumber, setSendingNumber] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/admin/whatsapp/status');
            const { status: currentStatus, whatsapp_sending_number } = response.data.data;
            setStatus(currentStatus);
            setSendingNumber(whatsapp_sending_number);
        } catch (error) {
            console.error('Failed to fetch WhatsApp status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();

        const onQr = ({ qr }) => {
            setQrCodeStr(qr);
            setStatus('qr_pending');
        };

        const onAuth = ({ whatsapp_sending_number }) => {
            setStatus('ready');
            setSendingNumber(whatsapp_sending_number);
            setQrCodeStr(null);
            toast.success(t('settings.general.whatsappAuthSuccess'));
        };

        const onAuthFailed = (data) => {
            setStatus('failed');
            toast.error(t('settings.general.whatsappAuthFailedReason', { reason: data?.reason || t('common.unknownError', 'Unknown error') }));
        };

        const onDisconnected = (data) => {
            setStatus('disconnected');
            setSendingNumber(null);
            setQrCodeStr(null);
            // Only show warning if it wasn't a deliberate logout
            if (data?.reason && data.reason !== 'logout') {
                toast.warning(t('settings.general.whatsappDisconnectedReason', { reason: data.reason }));
            }
        };

        const onConnect = () => {
            console.log('Socket connected, joining store_admins');
            socket.emit('join', 'store_admins');
        };

        const onConnectError = (err) => {
            console.error('Socket connection error:', err);
            toast.error(t('settings.general.whatsappConnectionError'));
            setStatus('failed');
            disconnectSocket();
        };

        socket.on('connect', onConnect);
        socket.on('whatsappQr', onQr);
        socket.on('whatsappAuthenticated', onAuth);
        socket.on('whatsappAuthFailed', onAuthFailed);
        socket.on('whatsappDisconnected', onDisconnected);
        socket.on('connect_error', onConnectError);

        return () => {
            socket.off('connect', onConnect);
            socket.off('whatsappQr', onQr);
            socket.off('whatsappAuthenticated', onAuth);
            socket.off('whatsappAuthFailed', onAuthFailed);
            socket.off('whatsappDisconnected', onDisconnected);
            socket.off('connect_error', onConnectError);
            disconnectSocket();
        };
    }, [fetchStatus, t]);

    const requestQR = () => {
        connectSocket();
        console.log('Emitting requestWhatsappQr');
        socket.emit('requestWhatsappQr');
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/admin/whatsapp/logout');
            setStatus('disconnected');
            setSendingNumber(null);
            setQrCodeStr(null);
            toast.success(t('settings.general.whatsappSessionCleared'));
        } catch (error) {
            // Error is handled by axios interceptor
        }
    };

    const sendMessage = async (message, phone) => {
        try {
            await axiosInstance.post('/admin/whatsapp/send', { message, phone });
            toast.success(t('settings.general.whatsappMessageSent'));
        } catch (error) {
            toast.error(t('settings.general.whatsappMessageFailed'));
        }
    };

    return {
        status,
        qrCodeStr,
        sendingNumber,
        loading,
        requestQR,
        logout,
        refreshStatus: fetchStatus,
        sendMessage
    };
};
