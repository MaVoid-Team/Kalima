import { useState, useCallback } from 'react';
import useApiMutation from '../useApiMutation';

export const useEmployeePerformance = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    const [loading, setLoading] = useState(false);
    const [confirmerStats, setConfirmerStats] = useState(null);
    const [confirmedCount, setConfirmedCount] = useState(null);
    const [createdAccounts, setCreatedAccounts] = useState(null);

    const fetchConfirmerStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchApi({ endpoint: '/admin/dashboard/confirmer-stats', method: 'get' });
            if (data?.success) setConfirmerStats(data.data);
        } finally { setLoading(false); }
    }, [fetchApi]);

    const fetchConfirmedCount = useCallback(async (month, year) => {
        setLoading(true);
        try {
            const queries = new URLSearchParams();
            if (month) queries.append('month', month);
            if (year) queries.append('year', year);
            const data = await fetchApi({ endpoint: `/purchases/confirmed-count?${queries.toString()}`, method: 'get' });
            if (data?.success) setConfirmedCount(data.data);
        } finally { setLoading(false); }
    }, [fetchApi]);

    const fetchCreatedAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchApi({ endpoint: '/admin/users/stats/created-accounts', method: 'get' });
            if (data?.success) setCreatedAccounts(data.data);
        } finally { setLoading(false); }
    }, [fetchApi]);

    return {
        loading: loading || apiLoading,
        confirmerStats,
        confirmedCount,
        createdAccounts,
        fetchConfirmerStats,
        fetchConfirmedCount,
        fetchCreatedAccounts
    };
};

export default useEmployeePerformance;
