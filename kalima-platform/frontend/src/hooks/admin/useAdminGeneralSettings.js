import { useState, useCallback, useEffect } from 'react';
import useApiMutation from '../useApiMutation';
import axiosInstance from '@/api/axios';
import { useTranslation } from 'react-i18next';

export const useAdminGeneralSettings = () => {
    const [settings, setSettings] = useState({
        whatsapp_sending_number: '',
        whatsapp_receiving_number: ''
    });
    const [loading, setLoading] = useState(true);
    const { mutate, loading: updateLoading } = useApiMutation();
    const { t } = useTranslation('admin');

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/general-settings');
            const data = response.data?.data || response.data || {};
            setSettings({
                whatsapp_sending_number: data.whatsapp_sending_number || '',
                whatsapp_receiving_number: data.whatsapp_receiving_number || ''
            });
        } catch (error) {
            console.error('Failed to fetch general settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            await mutate({
                endpoint: '/admin/general-settings/whatsapp_receiving_number',
                method: 'PUT',
                data: newSettings,
                defaultSuccessMessage: t('settings.general.updateSuccess', 'General settings updated successfully')
            });
            await fetchSettings();
            return true;
        } catch (error) {
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        updateLoading,
        updateSettings,
        refreshSettings: fetchSettings
    };
};
