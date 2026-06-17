/* eslint-disable react/prop-types */

import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    generatePaginationLinks,
} from '@/components/ui/pagination';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/storeUtils';

const getProductId = (product) => product?.id || product?._id;

export default function ProductPickerDialog({
    open,
    onOpenChange,
    products,
    pagination,
    loading,
    search,
    onSearchChange,
    onPageChange,
    onSelect,
    selectedProductId,
}) {
    const { t } = useTranslation('admin');
    const [searchValue, setSearchValue] = useState(search || '');
    
    // Per-render counter used to generate unique keys for pagination ellipsis items.
    // This is intentionally reset to 0 on every render.
    let ellipsisCount = 0;

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || 1)));

    useEffect(() => {
        setSearchValue(search || '');
    }, [search]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value) => {
            onSearchChange(value);
        }, 400),
        [onSearchChange]
    );

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" data-testid="coupons-product-picker-open-button">
                    {t('coupons.productPicker.open')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl custom-scrollbar" data-testid="coupons-product-picker-dialog">
                <DialogHeader>
                    <DialogTitle>{t('coupons.productPicker.title')}</DialogTitle>
                    <DialogDescription>{t('coupons.productPicker.description')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={handleSearch}
                            placeholder={t('coupons.productPicker.searchPlaceholder')}
                            className="ps-10"
                            data-testid="coupons-product-picker-search-input"
                        />
                    </div>

                    <div className="rounded-md border max-h-80 overflow-y-auto" data-testid="coupons-product-picker-list">
                        {loading ? (
                            <div className="h-36 flex items-center justify-center">
                                <LoadingSpinner className="h-6 w-6 text-primary" />
                            </div>
                        ) : products?.length ? (
                            <div className="divide-y">
                                {products.map((product) => {
                                    const productId = getProductId(product);
                                    const isSelected = String(productId) === String(selectedProductId);
                                    return (
                                        <div
                                            key={productId}
                                            className="p-3 flex items-center justify-between gap-3"
                                            data-testid={`coupons-product-picker-item-${productId}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{product.title || t('common.na')}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {product.serial || productId}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1" data-testid={`coupons-product-picker-price-${productId}`}>
                                                    {t('coupons.productPicker.price', { defaultValue: 'Price' })}: {formatCurrency(product.price, t)}
                                                </p>
                                                <p className="text-xs text-muted-foreground" data-testid={`coupons-product-picker-price-after-discount-${productId}`}>
                                                    {t('coupons.productPicker.priceAfterDiscount', { defaultValue: 'Price After Discount' })}: {formatCurrency(product.price_after_discount ?? product.price, t)}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={isSelected ? 'secondary' : 'default'}
                                                onClick={() => onSelect(product)}
                                                data-testid={`coupons-product-picker-select-${productId}`}
                                            >
                                                {isSelected
                                                    ? t('coupons.productPicker.selected')
                                                    : t('coupons.productPicker.select')}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-36 flex items-center justify-center text-sm text-muted-foreground" data-testid="coupons-product-picker-empty">
                                {t('coupons.productPicker.empty')}
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-end">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => onPageChange(Math.max(1, (pagination?.page || 1) - 1))}
                                            className={(pagination?.page || 1) <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            text={t('common.pagination.previous')}
                                            data-testid="coupons-product-picker-pagination-prev"
                                        />
                                    </PaginationItem>

                                    {generatePaginationLinks(pagination?.page || 1, totalPages).map((pageNumber) => {
                                        if (pageNumber === 'ellipsis') {
                                            ellipsisCount += 1;
                                            return (
                                                <PaginationItem key={`ellipsis-${ellipsisCount}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    onClick={() => onPageChange(pageNumber)}
                                                    isActive={(pagination?.page || 1) === pageNumber}
                                                    className="cursor-pointer"
                                                    data-testid={`coupons-product-picker-pagination-${pageNumber}`}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => onPageChange(Math.min(totalPages, (pagination?.page || 1) + 1))}
                                            className={(pagination?.page || 1) >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            text={t('common.pagination.next')}
                                            data-testid="coupons-product-picker-pagination-next"
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
