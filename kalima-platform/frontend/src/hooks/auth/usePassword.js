import useApiMutation from '../useApiMutation';

const usePassword = () => {
    const { mutate, loading, error } = useApiMutation();

    const forgotPassword = async (email) => {
        return await mutate({
            endpoint: '/auth/forgot-password',
            data: { email },
            defaultSuccessMessage: 'Password reset email sent'
        });
    };

    const resetPassword = async (token, newPassword) => {
        return await mutate({
            endpoint: '/auth/reset-password',
            data: { token, newPassword },
            defaultSuccessMessage: 'Password reset successfully'
        });
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await mutate({
            endpoint: '/auth/change-password',
            data: { currentPassword, newPassword },
            defaultSuccessMessage: 'Password changed successfully'
        });
    };

    const setPassword = async (password) => {
        return await mutate({
            endpoint: '/auth/set-password',
            data: { password },
            defaultSuccessMessage: 'Password set successfully'
        });
    };

    return {
        forgotPassword,
        resetPassword,
        changePassword,
        setPassword,
        loading,
        error
    };
};

export default usePassword;
