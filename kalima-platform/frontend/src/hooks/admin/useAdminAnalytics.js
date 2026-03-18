import { useState, useCallback } from 'react';
import useApiMutation from '../useApiMutation';
import { buildQueryString } from '@/lib/queryUtils';

export const useAdminAnalytics = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    const [loading, setLoading] = useState(false);
    const [storeStats, setStoreStats] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [productPerformance, setProductPerformance] = useState(null);
    const [responseTime, setResponseTime] = useState(null);

    const fetchStoreStats = useCallback(async (startDate, endDate) => {
        setLoading(true);
        try {
            const qsObj = {};
            if (startDate) qsObj.startDate = startDate;
            if (endDate) qsObj.endDate = endDate;
            
            const queryString = buildQueryString({ filters: qsObj });
            const queryPart = queryString ? `?${queryString}` : '';
            const data = await fetchApi({
                endpoint: `/admin/dashboard/store-stats${queryPart}`,
                method: 'get'
            });
            if (data?.success) {
                setStoreStats(data.data?.overview || data.data);
            }
        } finally { setLoading(false); }
    }, [fetchApi]);

    const fetchUserStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchApi({ endpoint: '/admin/dashboard/user-stats', method: 'get' });
            if (data?.success) setUserStats(data.data);
        } finally { setLoading(false); }
    }, [fetchApi]);

    const fetchProductPerformance = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchApi({ endpoint: '/admin/dashboard/product-performance', method: 'get' });
            if (data?.success) setProductPerformance(data.data);
        } finally { setLoading(false); }
    }, [fetchApi]);

    const fetchResponseTime = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchApi({ endpoint: '/admin/dashboard/response-time', method: 'get' });
            if (data?.success) setResponseTime(data.data);
        } finally { setLoading(false); }
    }, [fetchApi]);

    return {
        loading: loading || apiLoading,
        storeStats,
        userStats,
        productPerformance,
        responseTime,
        fetchStoreStats,
        fetchUserStats,
        fetchProductPerformance,
        fetchResponseTime
    };
};

export default useAdminAnalytics;
