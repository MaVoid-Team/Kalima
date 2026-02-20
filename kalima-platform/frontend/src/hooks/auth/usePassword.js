import { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const usePassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const forgotPassword = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/forgot-password', { email });
            toast.success(response.data?.message || 'Password reset email sent');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (token, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/reset-password', { token, newPassword });
            toast.success(response.data?.message || 'Password reset successfully');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/change-password', { currentPassword, newPassword });
            toast.success(response.data?.message || 'Password changed successfully');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const setPassword = async (password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/set-password', { password });
            toast.success(response.data?.message || 'Password set successfully');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
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
