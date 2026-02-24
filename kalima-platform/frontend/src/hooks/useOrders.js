import { useState, useEffect, useCallback } from 'react';
import useApiMutation from './useApiMutation';

export const useOrders = (optionsOrId = null) => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    let id = null;
    let initialLimit = 20;
    let autoFetch = true;

    if (optionsOrId !== null) {
        if (typeof optionsOrId === 'object') {
            id = optionsOrId.id || null;
            initialLimit = optionsOrId.limit || 20;
            if (optionsOrId.autoFetch !== undefined) autoFetch = optionsOrId.autoFetch;
        } else {
            id = optionsOrId;
        }
    }

    // List state
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: initialLimit
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        startDate: null,
        endDate: null
    });

    // Single order state
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [initLoading, setInitLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loading = apiLoading || initLoading;

    const buildQuery = useCallback(() => {
        const query = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
        });

        if (filters.search) query.append('search', filters.search);
        if (filters.status && filters.status !== 'all') query.append('status', filters.status);
        if (filters.startDate) query.append('startDate', filters.startDate.toISOString());
        if (filters.endDate) query.append('endDate', filters.endDate.toISOString());

        return query.toString();
    }, [pagination.page, pagination.limit, filters]);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await fetchApi({
                endpoint: `/purchases?${buildQuery()}`,
                method: 'get'
            });

            if (data?.success) {
                // The API might return purchases wrapped in data.purchases or just as the data object directly
                const resultData = data.data?.purchases || data.data || [];
                setOrders(resultData);

                const responsePage = data.pagination || data;
                setPagination(prev => ({
                    ...prev,
                    total: responsePage.total ?? prev.total,
                    page: responsePage.page ?? prev.page,
                    pages: responsePage.pages ?? prev.pages,
                    limit: responsePage.limit ?? prev.limit,
                }));
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setOrders([]);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi, buildQuery]);

    const fetchMyOrders = useCallback(async () => {
        try {
            const data = await fetchApi({
                endpoint: `/purchases/my?${buildQuery()}`,
                method: 'get'
            });

            if (data?.success) {
                const resultData = data.data?.purchases || data.data || [];
                setOrders(resultData);

                const responsePage = data.pagination || data;
                setPagination(prev => ({
                    ...prev,
                    total: responsePage.total ?? prev.total,
                    page: responsePage.page ?? prev.page,
                    pages: responsePage.pages ?? prev.pages,
                    limit: responsePage.limit ?? prev.limit,
                }));
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch my orders:", error);
            setOrders([]);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi, buildQuery]);

    const fetchOrderById = useCallback(async (orderId) => {
        try {
            const data = await fetchApi({
                endpoint: `/purchases/${orderId}`,
                method: 'get'
            });

            if (data?.success) {
                // The single purchase might be wrapped in data.purchase or just data.data
                const resultData = data.data?.purchase || data.data;
                setSelectedOrder(resultData);
            } else {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error(`Failed to fetch order ${orderId}:`, error);
            setSelectedOrder(null);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi]);

    useEffect(() => {
        if (!autoFetch) {
            setInitLoading(false);
            return;
        }
        setInitLoading(true);
        if (id) {
            fetchOrderById(id);
        } else {
            fetchOrders();
        }
    }, [id, fetchOrders, fetchOrderById, autoFetch]);

    const handleAction = async (actionFn) => {
        setActionLoading(true);
        try {
            return await actionFn();
        } finally {
            setActionLoading(false);
        }
    };

    const receiveOrder = (orderId) => handleAction(() => fetchApi({ endpoint: `/purchases/${orderId}/receive`, method: 'patch' }).then(res => { if (!id) fetchOrders(); else fetchOrderById(id); return res; }));
    const confirmOrder = (orderId) => handleAction(() => fetchApi({ endpoint: `/purchases/${orderId}/confirm`, method: 'patch' }).then(res => { if (!id) fetchOrders(); else fetchOrderById(id); return res; }));
    const returnOrder = (orderId) => handleAction(() => fetchApi({ endpoint: `/purchases/${orderId}/return`, method: 'patch' }).then(res => { if (!id) fetchOrders(); else fetchOrderById(id); return res; }));
    const addAdminNote = (orderId, note) => handleAction(() => fetchApi({ endpoint: `/purchases/${orderId}/admin-note`, method: 'patch', data: { admin_notes: note } }).then(res => { if (!id) fetchOrders(); else fetchOrderById(id); return res; }));

    const deleteOrder = (orderId) => handleAction(() => fetchApi({ endpoint: `/purchases/${orderId}`, method: 'delete' }).then(res => { if (!id) fetchOrders(); return res; }));
    const deleteOrderItem = (orderId, itemId) => handleAction(() => fetchApi({ endpoint: `/purchases/${orderId}/items/${itemId}`, method: 'delete' }).then(res => { if (id) fetchOrderById(id); return res; }));

    const setSearch = useCallback((query) => {
        setFilters((prev) => ({ ...prev, search: query }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setStatus = useCallback((status) => {
        setFilters((prev) => ({ ...prev, status }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setDateRange = useCallback((startDate, endDate) => {
        setFilters((prev) => ({ ...prev, startDate, endDate }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setPage = useCallback((page) => {
        setPagination((prev) => ({ ...prev, page }));
    }, []);

    return {
        // State
        orders,
        pagination,
        filters,
        selectedOrder,
        loading,
        actionLoading,

        // Actions
        fetchOrders,
        fetchMyOrders,
        fetchOrderById,
        receiveOrder,
        confirmOrder,
        returnOrder,
        addAdminNote,
        deleteOrder,
        deleteOrderItem,

        // Setters
        setSearch,
        setStatus,
        setDateRange,
        setPage
    };
};

export default useOrders;
