import { useTranslation } from 'react-i18next';
import useOrders from '../../../hooks/useOrders';
import OrdersToolbar from '../../../components/admin/orders/OrdersToolbar';
import OrdersTable from '../../../components/admin/orders/OrdersTable';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../components/ui/pagination';

export default function OrdersPage() {
    const { t } = useTranslation('admin');
    const {
        orders,
        pagination,
        filters,
        loading,
        setSearch,
        setStatus,
        setDateRange,
        setPage,
        fetchOrders
    } = useOrders({ limit: 6 });

    const handleSearch = (query) => {
        setSearch(query);
    };

    const handleStatus = (status) => {
        setStatus(status);
    };

    const handleDateRangeChange = (range) => {
        setDateRange(range?.from || null, range?.to || null);
    };

    const handleActionSuccess = () => {
        fetchOrders();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('orders.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('orders.totalOrders', { count: pagination.total || 0 })}
                    </p>
                </div>
            </div>

            <OrdersToolbar
                filters={filters}
                onSearchChange={handleSearch}
                onStatusChange={handleStatus}
                onDateRangeChange={handleDateRangeChange}
            />

            <OrdersTable
                orders={orders}
                loading={loading}
                onActionSuccess={handleActionSuccess}
            />

            {pagination.pages > 1 && (
                <div className="mt-6 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {[...Array(pagination.pages)].map((_, i) => (
                                <PaginationItem key={i + 1}>
                                    <PaginationLink
                                        onClick={() => setPage(i + 1)}
                                        isActive={pagination.page === i + 1}
                                        className="cursor-pointer"
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))}
                                    className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
