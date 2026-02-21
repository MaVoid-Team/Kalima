import { useCallback } from 'react';
import useApiMutation from '../useApiMutation';

const useLinkAccounts = () => {
    const { mutate, loading, error } = useApiMutation();

    const linkFirebaseAccount = async (idToken) => {
        return await mutate({
            endpoint: '/auth/link/firebase',
            data: { idToken },
            defaultSuccessMessage: 'Account linked successfully'
        });
    };

    const unlinkProvider = async (provider) => {
        return await mutate({
            endpoint: '/auth/unlink',
            data: { provider },
            defaultSuccessMessage: 'Account unlinked successfully'
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
