import { useCallback } from 'react';
import useApiMutation from './useApiMutation';
import { toast } from 'sonner';
import i18n from '../i18n';

export function useAdministrationGeneralSettings() {
    const { mutate, loading } = useApiMutation();

    /**
     * Fetches the administration WhatsApp number from the backend.
     * Shows a toast on failure and returns null.
     * @returns {Promise<string|null>}
     */
    const getAdminWhatsAppNumber = useCallback(async () => {
        try {
            const res = await mutate({
                endpoint: '/settings/contact',
                method: 'GET'
            }, false); // don't show success toast for fetching

            if (res?.success && res?.data?.whatsapp) {
                return res.data.whatsapp;
            }
            const contactInfo = res?.data || res;
            if (contactInfo?.whatsapp_number || contactInfo?.whatsapp) {
                return contactInfo.whatsapp_number || contactInfo.whatsapp;
            }
            throw new Error('No WhatsApp number found in response');
        } catch (error) {
            console.error('Failed to fetch admin WhatsApp number:', error);
            toast.error(i18n.t('common:whatsapp.fetchError', 'Failed to get WhatsApp number of the administration'));
            return null;
        }
    }, [mutate]);

    return {
        loading,
        getAdminWhatsAppNumber,
    };
}
