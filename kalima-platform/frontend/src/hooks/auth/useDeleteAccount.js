import { useTranslation } from 'react-i18next';
import useApiMutation from '../useApiMutation';
import { performLocalLogout } from '@/lib/authUtils';

const useDeleteAccount = () => {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('auth');

    const deleteAccount = async () => {
        try {
            await mutate({
                endpoint: '/auth/delete-account',
                method: 'delete',
                defaultSuccessMessage: t('deleteAccount.success', 'Account deleted successfully.'),
            });
            performLocalLogout();
        } catch (err) {
            // Error handling done by mutate
            throw err;
        }
    };

    return {
        deleteAccount,
        loading,
        error
    };
};

export default useDeleteAccount;
