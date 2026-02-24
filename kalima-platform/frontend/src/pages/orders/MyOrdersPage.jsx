import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import { PackageOpen } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import OrderCard from './OrderCard';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('orders.myOrders', 'My Orders')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('orders.subtitle', 'Track, manage, and view your order history')}
                    </p>
                </div>

                {/* Status Filter */}
                <div className="flex bg-muted/50 p-1 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setStatus(opt.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 ${(filters.status === opt.value || (!filters.status && opt.value === 'all'))
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="min-h-[400px]">
                {loading ? (
                    <LoadingSpinner />
                ) : orders && orders.length > 0 ? (
                    <div className="flex flex-col space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border/40 shadow-sm">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <PackageOpen className="h-12 w-12 text-primary opacity-80" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                            {t('orders.noOrders', 'No orders found')}
                        </h3>
                        <p className="text-muted-foreground max-w-sm">
                            {filters.status && filters.status !== 'all'
                                ? t('orders.noOrdersForStatus', 'You have no orders with this status.')
                                : t('orders.noOrdersDescription', 'Looks like you haven\'t placed any orders yet.')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.previous', 'Previous')}
                                />
                            </PaginationItem>

                            {[...Array(pagination.pages)].map((_, i) => (
                                <PaginationItem key={i + 1}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(i + 1)}
                                        isActive={pagination.page === i + 1}
                                        className="cursor-pointer"
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.next', 'Next')}
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
