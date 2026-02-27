import { useCallback } from 'react';
import useApiMutation from '../useApiMutation';
import { useTranslation } from 'react-i18next';

const useLinkAccounts = () => {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('auth');
    const linkFirebaseAccount = async (idToken) => {
        return await mutate({
            endpoint: '/auth/link/firebase',
            data: { idToken },
            defaultSuccessMessage: t('linkingAccounts.linked', 'Account linked successfully')
        });
    };

    const unlinkProvider = async (provider) => {
        return await mutate({
            endpoint: '/auth/unlink',
            data: { provider },
            defaultSuccessMessage: t('linkingAccounts.unlinked', 'Account unlinked successfully')
        });
    };

    const getLinkedProviders = useCallback(async () => {
        try {
            const responseData = await mutate({
                method: 'get',
                endpoint: '/auth/linked-providers'
            });
            return responseData?.linkedProviders || responseData?.data?.linkedProviders || [];
        } catch (err) {
            return [];
        }
    }, [mutate]);

    return {
        linkFirebaseAccount,
        unlinkProvider,
        getLinkedProviders,
        loading,
        error
    };
};

export default useLinkAccounts;
