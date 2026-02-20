import { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const useEmailVerification = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const verifyEmail = async (token) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/verify-email', { token });
            toast.success(response.data?.message || 'Email verified successfully');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendVerification = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/send-verification');
            toast.success(response.data?.message || 'Verification email sent');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/resend-verification', { email });
            toast.success(response.data?.message || 'Verification email sent (if account exists)');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
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
