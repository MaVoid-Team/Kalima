import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TicketPercent, Download } from 'lucide-react';

import useAdminCoupons from '@/hooks/admin/useAdminCoupons';
import useExport from '@/hooks/useExport';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CouponFilters from '@/components/admin/coupons/CouponFilters';
import CouponsTable from '@/components/admin/coupons/CouponsTable';
import CouponsStatsCards from '@/components/admin/coupons/CouponsStatsCards';
import CreateCouponDialog from '@/components/admin/coupons/CreateCouponDialog';
import EditCouponDialog from '@/components/admin/coupons/EditCouponDialog';
import DeleteCouponDialog from '@/components/admin/coupons/DeleteCouponDialog';
import { useProducts } from '@/hooks/useProducts';
import { getCouponId, isCouponActive } from '@/lib/couponUtils';

const getProductId = (product) => product?.id || product?._id;

export default function CouponsPage() {
    const { t, i18n } = useTranslation('admin');
    const {
        coupons,
        pagination,
        filters,
        loadCoupons,
        setSearch,
        setActive,
        setDiscountType,
        setProductFilter,
        setCategoryFilter,
        setStartDate,
        setEndDate,
        clearProductFilter,
        clearCategoryFilter,
        setPage,
        getCouponsStats,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        generateCouponCode,
        apiLoading,
    } = useAdminCoupons({ enableList: true });

    const {
        products,
        pagination: productPagination,
        filters: productFilters,
        setSearch: setProductSearch,
        setPage: setProductPage,
        loading: productsLoading,
    } = useProducts();

    const { exportData, loading: exportLoading, exportProgress } = useExport();
    const [selectedIds, setSelectedIds] = useState([]);
    const [couponsStats, setCouponsStats] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const filteredCoupons = useMemo(() => {
        const normalizedSearch = (filters.search || '').trim().toLowerCase();
        if (!normalizedSearch) return coupons;

        return coupons.filter((coupon) =>
            String(coupon?.code || '').toLowerCase().includes(normalizedSearch)
        );
    }, [coupons, filters.search]);

    const hasSearchFilter = Boolean((filters.search || '').trim());
    const couponsCount = hasSearchFilter ? filteredCoupons.length : pagination.total;

    const loadCouponsStats = useCallback(async () => {
        const stats = await getCouponsStats();
        if (stats) {
            setCouponsStats(stats);
        }
    }, [getCouponsStats]);

    useEffect(() => {
        loadCouponsStats();
    }, [loadCouponsStats]);

    const handleSelect = (id, checked) => {
        setSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filteredCoupons.map((c) => getCouponId(c)));
        } else {
            setSelectedIds([]);
        }
    };

    const handleExport = async (format) => {
        const normalizedSearch = (filters.search || '').trim();
        const idsForExport = normalizedSearch
            ? Array.from(new Set(filteredCoupons.map((coupon) => getCouponId(coupon)).filter(Boolean)))
            : selectedIds;

        if (normalizedSearch) {
            setSelectedIds(idsForExport);
        }

        await exportData({
            resource: 'coupons',
            format,
            ids: idsForExport,
            filters:{
                active: filters.active === 'all' ? undefined : filters.active == "true" ? true : false,
                product_id: filters.product_id || undefined,
                category_id: filters.category_id || undefined,
                isAmount: filters.discount_type === 'AMOUNT'
                    ? 1
                    : filters.discount_type === 'PERCENTAGE' ? 0 : undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            }
        });

        // After export completes, clear selected IDs
        setSelectedIds([]);
    };

    const handleCreate = async (payload) => {
        const result = await createCoupon(payload);
        await loadCoupons();
        await loadCouponsStats();
        return result ?? true;
    };

    const handleEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setEditOpen(true);
    };

    const handleUpdate = async (couponId, payload) => {
        const result = await updateCoupon(couponId, payload);
        await loadCoupons();
        await loadCouponsStats();
        return result ?? true;
    };

    const handleDelete = (coupon) => {
        setSelectedCoupon(coupon);
        setDeleteOpen(true);
    };

    const handleToggleActivation = async (coupon) => {
        const couponId = getCouponId(coupon);
        if (!couponId) return;

        await updateCoupon(couponId, {
            is_active: !isCouponActive(coupon),
        });

        await loadCoupons();
        await loadCouponsStats();
    };

    const handleDeleteConfirm = async () => {
        const couponId = getCouponId(selectedCoupon);
        if (!couponId) return;

        await deleteCoupon(couponId);
        setDeleteOpen(false);
        setSelectedCoupon(null);
        await loadCoupons();
        await loadCouponsStats();
    };

    return (
        <div className="space-y-6 no-scrollbar" data-testid="coupons-page">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <TicketPercent className="h-8 w-8 text-primary" />
                        {t('coupons.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('coupons.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        {t('coupons.totalCoupons', { count: couponsCount })}
                    </p>
                    {/* Export dropdown */}
                    <DropdownMenu dir={i18n.dir()}>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline" data-testid="coupons-export-button">
                                <Download className="me-2 h-4 w-4" />
                                {t('coupons.export', 'Export')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport('csv')} disabled={exportLoading} data-testid="coupons-export-csv">
                                {t('coupons.exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('xlsx')} disabled={exportLoading} data-testid="coupons-export-excel">
                                {t('coupons.exportXlsx', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <CreateCouponDialog
                        onGenerateCode={generateCouponCode}
                        onSubmitCoupon={handleCreate}
                        loading={apiLoading}
                        onSuccess={loadCoupons}
                        products={products}
                        productPagination={productPagination}
                        productsLoading={productsLoading}
                        productSearch={productFilters.search}
                        onProductSearchChange={setProductSearch}
                        onProductPageChange={setProductPage}
                    />
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

            <CouponsStatsCards
                stats={couponsStats}
                loading={apiLoading}
            />

            <CouponFilters
                filters={filters}
                onSearchChange={setSearch}
                onActiveChange={setActive}
                onDiscountTypeChange={setDiscountType}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                products={products}
                productPagination={productPagination}
                productsLoading={productsLoading}
                productSearch={productFilters.search}
                onProductSearchChange={setProductSearch}
                onProductPageChange={setProductPage}
                onProductFilterChange={(product) => setProductFilter(getProductId(product))}
                onProductFilterClear={clearProductFilter}
                onCategoryFilterChange={setCategoryFilter}
                onCategoryFilterClear={clearCategoryFilter}
            />

            <CouponsTable
                coupons={filteredCoupons}
                loading={apiLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActivation={handleToggleActivation}
                pagination={pagination}
                onPageChange={setPage}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
            />

            <EditCouponDialog
                open={editOpen}
                onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) setSelectedCoupon(null);
                }}
                coupon={selectedCoupon}
                loading={apiLoading}
                onGenerateCode={generateCouponCode}
                onSubmitCoupon={handleUpdate}
                onSuccess={loadCoupons}
                products={products}
                productPagination={productPagination}
                productsLoading={productsLoading}
                productSearch={productFilters.search}
                onProductSearchChange={setProductSearch}
                onProductPageChange={setProductPage}
            />

            <DeleteCouponDialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open);
                    if (!open) setSelectedCoupon(null);
                }}
                onConfirm={handleDeleteConfirm}
                loading={apiLoading}
                couponCode={selectedCoupon?.code}
            />
        </div>
    );
}
