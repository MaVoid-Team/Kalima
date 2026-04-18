import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import OrdersPageHeader from '@/components/orders/OrdersPageHeader';
import OrdersStatusFilter from '@/components/orders/OrdersStatusFilter';
import OrdersListState from '@/components/orders/OrdersListState';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
    PaginationEllipsis,
    generatePaginationLinks,
} from '@/components/ui/pagination';

import { useNavigate } from 'react-router-dom';
import useRole from '@/hooks/useRole';

const MyOrdersPage = () => {
    const { t } = useTranslation('admin');
    const { isStudent } = useRole();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isStudent) {
            navigate('/', { replace: true });
        }
    }, [isStudent, navigate]);

    const {
        orders,
        pagination,
        loading,
        fetchMyOrders,
        setPage,
        filters,
        setStatus,
    } = useOrders({ autoFetch: false });

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

            {pagination.pages > 1 && (
                <div className="mt-4 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.previous', 'Previous')}
                                    data-testid="orders-pagination-previous-button"
                                />
                            </PaginationItem>

                            {generatePaginationLinks(pagination.page, pagination.pages).map((link, idx) =>
                                link === 'ellipsis' ? (
                                    <PaginationItem key={`ellipsis-${idx}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={link}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(link)}
                                            isActive={pagination.page === link}
                                            className="cursor-pointer"
                                            data-testid={`orders-pagination-page-${link}-button`}
                                        >
                                            {link}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.next', 'Next')}
                                    data-testid="orders-pagination-next-button"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
