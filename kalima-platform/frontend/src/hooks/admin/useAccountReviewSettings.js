import { useState, useCallback, useEffect } from 'react';
import useApiMutation from '../useApiMutation';
import axiosInstance from '@/api/axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const useAccountReviewSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const { mutate, loading: updateLoading } = useApiMutation();
    const { t } = useTranslation('admin');

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/account-review-settings');
            // Assume data is { Teacher: true, Student: false, Parent: true } etc or an array
            const data = response.data?.data || response.data || {};
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch account review settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            await mutate({
                endpoint: '/admin/account-review-settings',
                method: 'PUT',
                data: newSettings,
                defaultSuccessMessage: t('settings.accountReview.updateSuccess', 'Account review settings updated successfully')
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
