import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import OrdersPageHeader from '@/components/orders/OrdersPageHeader';
import OrdersStatusFilter from '@/components/orders/OrdersStatusFilter';
import OrdersListState from '@/components/orders/OrdersListState';
import OrdersPagination from '@/components/orders/OrdersPagination';

const MyOrdersPage = () => {
    const { t } = useTranslation('admin');

    // Use a limit of 6 as requested
    const {
        orders,
        pagination,
        loading,
        fetchMyOrders,
        setPage,
        filters,
        setStatus,
    } = useOrders({ limit: 6, autoFetch: false });

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPage(newPage);
    };

    const statusOptions = [
        { value: 'all', label: t('orders.status.all', 'All Orders') },
        { value: 'pending', label: t('orders.status.pending', 'Pending') },
        { value: 'received', label: t('orders.status.received', 'Received') },
        { value: 'confirmed', label: t('orders.status.confirmed', 'Confirmed') },
        { value: 'returned', label: t('orders.status.returned', 'Returned') },
    ];

    return (
        <div className="container py-10 max-w-5xl mx-auto space-y-8 animate-fade-in px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <OrdersPageHeader
                    title={t('orders.myOrders', 'My Orders')}
                    subtitle={t('orders.subtitle', 'Track, manage, and view your order history')}
                />

                <OrdersStatusFilter
                    statusOptions={statusOptions}
                    filters={filters}
                    onStatusChange={setStatus}
                />
            </div>

            <OrdersListState
                loading={loading}
                orders={orders}
                filters={filters}
                t={t}
            />

            <OrdersPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                t={t}
            />
        </div>
    );
};

export default MyOrdersPage;
