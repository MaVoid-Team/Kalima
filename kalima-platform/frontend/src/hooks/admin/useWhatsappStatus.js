import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import socket, { connectSocket } from '@/api/socket';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';

export const useWhatsappStatus = () => {
    const { t } = useTranslation('admin');
    const [status, setStatus] = useState('disconnected'); // 'disconnected' | 'qr_pending' | 'ready' | 'failed'
    const [qrCodeStr, setQrCodeStr] = useState(null);
    const [sendingNumber, setSendingNumber] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/admin/whatsapp/status');
            const { status: currentStatus, whatsapp_sending_number, qr } = response.data.data;
            setQrCodeStr(qr || null);
            // A qr_pending state without a QR is stale and cannot make progress.
            // Present a retryable failure instead of an infinite initialization screen.
            setStatus(currentStatus === 'qr_pending' && !qr ? 'failed' : currentStatus);
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
            setIsActionLoading(false);
        };

        const onAuth = (data) => {
            setStatus('ready');
            setSendingNumber(data.whatsapp_sending_number);
            setQrCodeStr(null);
            setIsActionLoading(false);
            toast.success(t('settings.general.whatsappAuthSuccess'));
        };

        const onAuthFailed = (data) => {
            setStatus('failed');
            setIsActionLoading(false);
            toast.error(t('settings.general.whatsappAuthFailedReason', { reason: data?.reason || t('common.unknownError', 'Unknown error') }));
        };

        const onDisconnected = (data) => {
            setStatus('disconnected');
            setSendingNumber(null);
            setQrCodeStr(null);
            setIsActionLoading(false);
            // Only show warning if it wasn't a deliberate logout
            if (data?.reason && data.reason !== 'logout') {
                toast.warning(t('settings.general.whatsappDisconnectedReason', { reason: data.reason }));
            }
        };

        const onStatusChanged = ({ status: nextStatus }) => {
            if (nextStatus === 'ready') return;
            setStatus(nextStatus);
            if (nextStatus !== 'qr_pending') {
                setQrCodeStr(null);
            }
            setIsActionLoading(['initializing', 'reconnecting'].includes(nextStatus));
        };

        const onConnect = () => {
            console.log('Socket already connected or just connected, joining store_admins');
            socket.emit('join', 'store_admins');
        };

        // If already connected, join immediately
        if (socket.connected) {
            onConnect();
        }

        const onConnectError = () => {
            setStatus('failed');
            setIsActionLoading(false);
        };


        socket.on('connect', onConnect);
        socket.on('whatsappQr', onQr);
        socket.on('whatsappAuthenticated', onAuth);
        socket.on('whatsappAuthFailed', onAuthFailed);
        socket.on('whatsappDisconnected', onDisconnected);
        socket.on('whatsappStatusChanged', onStatusChanged);
        socket.on('connect_error', onConnectError);

        // The shared socket is intentionally created with autoConnect disabled.
        // Open it here so this hook works even when no other app context has
        // already connected the socket.
        connectSocket();

        return () => {
            socket.off('connect', onConnect);
            socket.off('whatsappQr', onQr);
            socket.off('whatsappAuthenticated', onAuth);
            socket.off('whatsappAuthFailed', onAuthFailed);
            socket.off('whatsappDisconnected', onDisconnected);
            socket.off('whatsappStatusChanged', onStatusChanged);
            socket.off('connect_error', onConnectError);
        };
    }, [fetchStatus, t]);


    const requestQR = () => {
        setIsActionLoading(true);
        setStatus('initializing');
        console.log('Emitting requestWhatsappQr');

        // Re-open the shared client when a previous connection dropped while
        // the settings page was still mounted.
        connectSocket();
        socket.emit('requestWhatsappQr');
    };

    const logout = async () => {
        setIsActionLoading(true);
        try {
            await axiosInstance.post('/admin/whatsapp/logout');
            setStatus('disconnected');
            setSendingNumber(null);
            setQrCodeStr(null);
            setIsActionLoading(false);
            toast.success(t('settings.general.whatsappSessionCleared'));
        } catch (error) {
            setIsActionLoading(false);
        }
    };

    const sendMessage = async (message, phone) => {
        try {
            await axiosInstance.post('/admin/whatsapp/send', { message, phone });
            toast.success(t('settings.general.whatsappMessageSent'));
        } catch (error) {
            toast.error(t('settings.general.whatsappMessageFailed'));
        } finally {
            setIsActionLoading(false);
        }
    };

    return {
        status,
        qrCodeStr,
        sendingNumber,
        loading,
        isActionLoading,
        requestQR,
        logout,
        refreshStatus: fetchStatus,
        sendMessage
    };
};
