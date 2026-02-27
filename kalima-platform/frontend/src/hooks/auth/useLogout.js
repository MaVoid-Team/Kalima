import { useTranslation } from 'react-i18next';
import useApiMutation from '../useApiMutation';
import { performLocalLogout } from '@/lib/authUtils';

const useLogout = () => {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('auth');

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await mutate({ endpoint: '/auth/logout', data: { refreshToken } });
            }
        } catch (err) {
            // Error is handled by mutate, we just want to ensure logout finishes
        } finally {
            performLocalLogout();
        }
    };

    const logoutAll = async () => {
        try {
            await mutate({
                endpoint: '/auth/logout-all',
                defaultSuccessMessage: t('logout.successAllDevices', 'Logged out from all devices successfully!'),
            });
        } catch (err) {
            // Error handling done by mutate
        } finally {
            performLocalLogout();
        }
    };

    return {
        logout,
        logoutAll,
        loading,
        error
    };
};

export default useLogout;
