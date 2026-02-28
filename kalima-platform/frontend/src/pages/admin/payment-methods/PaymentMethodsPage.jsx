import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, PlusCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAdminPaymentMethods } from '@/hooks/admin/useAdminPaymentMethods';
import useExport from '@/hooks/useExport';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
    PaginationEllipsis,
    generatePaginationLinks
} from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import PaymentMethodFilters from '@/components/admin/payment-methods/PaymentMethodFilters';
import PaymentMethodsTable from '@/components/admin/payment-methods/PaymentMethodsTable';
import CreatePaymentMethodDialog from '@/components/admin/payment-methods/CreatePaymentMethodDialog';
import EditPaymentMethodDialog from '@/components/admin/payment-methods/EditPaymentMethodDialog';
import DeletePaymentMethodDialog from '@/components/admin/payment-methods/DeletePaymentMethodDialog';

export default function PaymentMethodsPage() {
    const { t, i18n } = useTranslation('admin');

    const {
        paymentMethods,
        pagination,
        filters,
        loading,
        actionLoading,
        fetchPaymentMethods,
        updatePaymentMethod,
        deletePaymentMethod,
        bulkUpdateStatus,
        setSearch,
        setStatusFilter,
        setPage,
    } = useAdminPaymentMethods();

    const { exportData, loading: exportLoading, exportProgress } = useExport();
    const [selectedIds, setSelectedIds] = useState([]);

    const [createOpen, setCreateOpen] = useState(false);
    const [editPaymentMethod, setEditPaymentMethod] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const load = useCallback(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSelect = (id, checked) => {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(paymentMethods.map(pm => pm.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleEdit = (paymentMethod) => {
        setEditPaymentMethod(paymentMethod);
        setEditOpen(true);
    };

    const handleStatusToggle = async (paymentMethod) => {
        await updatePaymentMethod(paymentMethod.id, { status: !paymentMethod.status });
        load();
    };

    const handleDelete = async (paymentMethod) => {
        setDeleteTarget(paymentMethod);
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        const res = await deletePaymentMethod(deleteTarget.id);
        if (res?.success) {
            setDeleteOpen(false);
            setDeleteTarget(null);
            load();
        }
    };

    const handleBulkStatusToggle = async (status) => {
        if (selectedIds.length === 0) return;
        await bulkUpdateStatus(selectedIds, status);
        setSelectedIds([]);
        load();
    };

    const handleExport = (format) => {
        exportData({
            resource: 'payment-methods',
            format,
            ids: selectedIds,
            filters: {
                search: filters.search,
                status: filters.status,
            },
        });
    };

    return (
        <div className="space-y-6 no-scrollbar" data-testid="payment-methods-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CreditCard className="h-8 w-8 text-primary" />
                        {t('paymentMethods.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('paymentMethods.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        {t('paymentMethods.totalMethods', { count: pagination.total })}
                    </p>

                    {/* Export dropdown */}
                    <DropdownMenu dir={i18n.dir()}>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline" data-testid="payment-methods-export-button">
                                <Download className="me-2 h-4 w-4" />
                                {t('orders.export', 'Export')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleExport('csv')}
                                disabled={exportLoading}
                                data-testid="payment-methods-export-csv"
                            >
                                {t('orders.exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExport('xlsx')}
                                disabled={exportLoading}
                                data-testid="payment-methods-export-excel"
                            >
                                {t('orders.exportXlsx', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={() => setCreateOpen(true)}
                        data-testid="create-payment-method-button"
                    >
                        <PlusCircle className="me-2 h-4 w-4" />
                        {t('paymentMethods.createMethod')}
                    </Button>
                </div>
            </div>

            {exportLoading && exportProgress > 0 && (
                <div>
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                        <span>{exportProgress < 100 ? t('export.exporting', 'Exporting...') : t('export.processing', 'Processing...')}</span>
                        <span>{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                </div>
            )}

            {/* Filters */}
            <PaymentMethodFilters
                filters={filters}
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
                selectedCount={selectedIds.length}
                onBulkActivate={() => handleBulkStatusToggle(true)}
                onBulkDeactivate={() => handleBulkStatusToggle(false)}
            />

            {/* Table */}
            <PaymentMethodsTable
                paymentMethods={paymentMethods}
                loading={loading}
                onEdit={handleEdit}
                onStatusToggle={handleStatusToggle}
                onDelete={handleDelete}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-4 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.previous')}
                                    data-testid="payment-methods-pagination-prev"
                                />
                            </PaginationItem>

                            {generatePaginationLinks(pagination.page, pagination.pages).map((pageNumber, index) => {
                                if (pageNumber === 'ellipsis') {
                                    return (
                                        <PaginationItem key={`ellipsis-${index}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            onClick={() => setPage(pageNumber)}
                                            isActive={pagination.page === pageNumber}
                                            className="cursor-pointer"
                                            data-testid={`payment-methods-pagination-${pageNumber}`}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))}
                                    className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.next')}
                                    data-testid="payment-methods-pagination-next"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Create Dialog */}
            <CreatePaymentMethodDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={load}
            />

            {/* Edit Dialog */}
            <EditPaymentMethodDialog
                open={editOpen}
                onOpenChange={(v) => { setEditOpen(v); if (!v) setEditPaymentMethod(null); }}
                paymentMethod={editPaymentMethod}
                onSuccess={load}
            />

            {/* Delete Confirmation Dialog */}
            <DeletePaymentMethodDialog
                open={deleteOpen}
                onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteTarget(null); }}
                onConfirm={handleDeleteConfirm}
                loading={actionLoading}
                paymentMethodName={deleteTarget?.name}
            />
        </div>
    );
}
