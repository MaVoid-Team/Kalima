import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
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

import ProductFilters from '@/components/admin/products/ProductFilters';
import ProductsTable from '@/components/admin/products/ProductsTable';
import EditProductDialog from '@/components/admin/products/EditProductDialog';
import DeleteProductDialog from '@/components/admin/products/DeleteProductDialog';

export default function ProductsPage() {
    const { t } = useTranslation('admin');

    const {
        products,
        pagination,
        filters,
        loading,
        actionLoading,
        fetchProducts,
        updateProduct,
        deleteProduct,
        setSearch,
        setCategoryFilter,
        setArchivedFilter,
        setPage,
    } = useAdminProducts();

    const [editProduct, setEditProduct] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const load = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        load();
    }, [load]);

    const handleEdit = (product) => {
        setEditProduct(product);
        setEditOpen(true);
    };

    const handleArchiveToggle = async (product) => {
        await updateProduct(product.id, { is_archived: !product.is_archived });
        load();
    };

    const handleDelete = async (product) => {
        setDeleteTarget(product);
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        const res = await deleteProduct(deleteTarget.id);
        if (res?.success) {
            setDeleteOpen(false);
            setDeleteTarget(null);
            load();
        }
    };

    return (
        <div className="space-y-6 no-scrollbar" data-testid="products-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Package className="h-8 w-8 text-primary" />
                        {t('products.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('products.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        {t('products.totalProducts', { count: pagination.total })}
                    </p>
                    <Link to="/admin/products/create">
                        <Button data-testid="create-product-page-trigger">
                            <PlusCircle className="me-2 h-4 w-4" />
                            {t('products.createProduct')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <ProductFilters
                filters={filters}
                onSearchChange={setSearch}
                onCategoryChange={setCategoryFilter}
                onArchivedChange={setArchivedFilter}
            />

            {/* Table */}
            <ProductsTable
                products={products}
                loading={loading}
                onEdit={handleEdit}
                onArchiveToggle={handleArchiveToggle}
                onDelete={handleDelete}
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
                                    data-testid="products-pagination-prev"
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
                                            data-testid={`products-pagination-${pageNumber}`}
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
                                    data-testid="products-pagination-next"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Edit Dialog */}
            <EditProductDialog
                product={editProduct}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={load}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteProductDialog
                open={deleteOpen}
                onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteTarget(null); }}
                onConfirm={handleDeleteConfirm}
                loading={actionLoading}
                productTitle={deleteTarget?.title}
            />
        </div>
    );
}
