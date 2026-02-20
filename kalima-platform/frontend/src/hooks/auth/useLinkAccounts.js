import { useState, useCallback } from 'react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const useLinkAccounts = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const linkFirebaseAccount = async (idToken) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/link/firebase', { idToken });
            toast.success(response.data?.message || 'Account linked successfully');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const unlinkProvider = async (provider) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/unlink', { provider });
            toast.success(response.data?.message || 'Account unlinked successfully');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getLinkedProviders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/auth/linked-providers');
            return response.data?.linkedProviders || response.data?.data?.linkedProviders || [];
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        linkFirebaseAccount,
        unlinkProvider,
        getLinkedProviders,
        loading,
        error
    };
};

export default useLinkAccounts;
