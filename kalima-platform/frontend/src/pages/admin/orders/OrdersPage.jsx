import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useOrders from '@/hooks/useOrders';
import OrdersToolbar from '@/components/admin/orders/OrdersToolbar';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import StoreStatsCards from '@/components/admin/orders/StoreStatsCards';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useExport from '@/hooks/useExport';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

    const { exportData, loading: exportLoading } = useExport();
    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelect = (id, checked) => {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(orders.map(order => order.id));
        } else {
            setSelectedIds([]);
        }
    };

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

    const handleExport = (format) => {
        exportData({
            resource: 'purchases',
            format: format,
            ids: selectedIds,
            filters // pass current filters to export function
        });
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
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                {t('orders.export', 'Export')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport('csv')} disabled={exportLoading}>
                                {t('orders.exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('xlsx')} disabled={exportLoading}>
                                {t('orders.exportXlsx', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <StoreStatsCards />

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
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
            />

            {pagination.pages > 1 && (
                <div className="mt-6 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    text={t('common.pagination.previous')}
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
                                    text={t('common.pagination.next')}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
