import { useTranslation } from 'react-i18next';
import useApiMutation from '../useApiMutation';

const useEmailVerification = () => {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('auth');
    const verifyEmail = async (token) => {
        return await mutate({
            endpoint: '/auth/verify-email',
            data: { token },
            defaultSuccessMessage: t('verifyEmail.success', 'Email verified successfully')
        });
    };

    const sendVerification = async () => {
        return await mutate({
            endpoint: '/auth/send-verification',
            defaultSuccessMessage: t('veryifyEmail.verificationEmailSent', 'Verification email sent!')
        });
    };

    const resendVerification = async (email) => {
        return await mutate({
            endpoint: '/auth/resend-verification',
            data: { email },
            defaultSuccessMessage: t('verifyEmail.verificationEmailResent', 'Verification email sent (if account exists)')
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
