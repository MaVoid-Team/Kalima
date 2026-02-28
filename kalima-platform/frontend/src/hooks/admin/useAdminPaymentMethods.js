import { useState, useCallback } from 'react';
import useApiMutation from '../useApiMutation';

export const useAdminPaymentMethods = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    // List State
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 20
    });
    const [filters, setFilters] = useState({
        search: '',
        status: null, // null = all, true = active only, false = inactive only
    });

    // Detail State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const [initLoading, setInitLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loading = apiLoading || initLoading;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const buildQuery = useCallback(() => {
        const query = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
        });

        if (filters.search) query.append('search', filters.search);
        if (filters.status !== null && filters.status !== undefined) {
            query.append('status', filters.status);
        }

        return query.toString();
    }, [pagination.page, pagination.limit, filters]);

    const handleAction = useCallback(async (actionFn) => {
        setActionLoading(true);
        try {
            return await actionFn();
        } finally {
            setActionLoading(false);
        }
    }, []);

    // ─── Fetchers ────────────────────────────────────────────────────────────

    const fetchPaymentMethods = useCallback(async () => {
        setInitLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/payment-methods?${buildQuery()}`,
                method: 'get'
            });

            if (data?.success) {
                const results = data.data?.data ?? [];
                const meta = data.data ?? {};

                setPaymentMethods(results);
                setPagination(prev => ({
                    ...prev,
                    total: meta.total ?? prev.total,
                    page: meta.page ?? prev.page,
                    pages: meta.pages ?? Math.ceil((meta.total ?? prev.total) / (meta.limit ?? prev.limit)) ?? prev.pages,
                    limit: meta.limit ?? prev.limit,
                }));
            } else {
                setPaymentMethods([]);
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
            setPaymentMethods([]);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi, buildQuery]);

    const fetchPaymentMethodById = useCallback(async (paymentMethodId) => {
        setInitLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/payment-methods/${paymentMethodId}`,
                method: 'get'
            });

            if (data?.success) {
                setSelectedPaymentMethod(data.data);
            } else {
                setSelectedPaymentMethod(null);
            }
        } catch (error) {
            console.error(`Failed to fetch payment method ${paymentMethodId}:`, error);
            setSelectedPaymentMethod(null);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi]);

    // ─── Payment Method CRUD ─────────────────────────────────────────────────────

    const createPaymentMethod = (formData, onUploadProgress) =>
        handleAction(() => fetchApi({
            endpoint: '/payment-methods',
            method: 'post',
            data: formData,
            onUploadProgress,
        }).then(res => {
            // Update local state with the response data (includes image_url)
            if (res?.success) {
                // Refresh the list to show new data
                fetchPaymentMethods();
            }
            return res;
        }));

    const updatePaymentMethod = (paymentMethodId, formData, onUploadProgress) =>
        handleAction(() => fetchApi({
            endpoint: `/payment-methods/${paymentMethodId}`,
            method: 'patch',
            data: formData,
            onUploadProgress,
        }).then(res => {
            // Update the local state with the response data
            if (res?.success) {
                setSelectedPaymentMethod(res.data);
            }
            return res;
        }));

    const deletePaymentMethod = (paymentMethodId) =>
        handleAction(() => fetchApi({
            endpoint: `/payment-methods/${paymentMethodId}`,
            method: 'delete',
        }));

    // ─── Bulk Actions ───────────────────────────────────────────────────────────

    const bulkUpdateStatus = (paymentMethodIds, status) =>
        handleAction(() => Promise.all(
            paymentMethodIds.map(id =>
                fetchApi({
                    endpoint: `/payment-methods/${id}`,
                    method: 'patch',
                    data: { status },
                })
            )
        ));

    // ─── Filter Setters ───────────────────────────────────────────────────────

    const setSearch = useCallback((query) => {
        setFilters(prev => ({ ...prev, search: query }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const setStatusFilter = useCallback((status) => {
        setFilters(prev => ({ ...prev, status }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const setPage = useCallback((page) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    // ─────────────────────────────────────────────────────────────────────────

    return {
        // State
        paymentMethods,
        pagination,
        filters,
        selectedPaymentMethod,
        loading,
        actionLoading,

        // Fetchers
        fetchPaymentMethods,
        fetchPaymentMethodById,

        // Payment Method CRUD
        createPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,

        // Bulk Actions
        bulkUpdateStatus,

        // Filter Setters
        setSearch,
        setStatusFilter,
        setPage,
    };
};

export default useAdminPaymentMethods;
