import { useCallback, useState } from 'react';
import axiosInstance from '@/api/axios';

export default function useAdminAppreciationPage() {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadPage = useCallback(async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/appreciation-page`);
            const nextPage = response.data?.data || null;
            setPage(nextPage);
            return nextPage;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        page,
        loading,
        error,
        loadPage,
    };
}
