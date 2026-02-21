import useApiMutation from '../useApiMutation';

const useEmailVerification = () => {
    const { mutate, loading, error } = useApiMutation();

    const verifyEmail = async (token) => {
        return await mutate({
            endpoint: '/auth/verify-email',
            data: { token },
            defaultSuccessMessage: 'Email verified successfully'
        });
    };

    const sendVerification = async () => {
        return await mutate({
            endpoint: '/auth/send-verification',
            defaultSuccessMessage: 'Verification email sent'
        });
    };

    const resendVerification = async (email) => {
        return await mutate({
            endpoint: '/auth/resend-verification',
            data: { email },
            defaultSuccessMessage: 'Verification email sent (if account exists)'
        });
    };

    return {
        verifyEmail,
        sendVerification,
        resendVerification,
        loading,
        error
    };
};

export default useEmailVerification;
