/* eslint-disable react/prop-types */

import { Search, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/storeUtils';

const getProductId = (product) => product?.id || product?._id;

export default function CouponFilters({
    filters,
    onSearchChange,
    onActiveChange,
    onDiscountTypeChange,
    onStartDateChange,
    onEndDateChange,
    products,
    productPagination,
    productsLoading,
    productSearch,
    onProductSearchChange,
    onProductPageChange,
    onProductFilterChange,
    onProductFilterClear,
}) {
    const { t, i18n } = useTranslation('admin');
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const [productSearchValue, setProductSearchValue] = useState(productSearch || '');
    const productSearchInputRef = useRef(null);
    const isRtl = i18n.language?.startsWith('ar');

    const selectedProduct = products?.find(
        (product) => String(getProductId(product)) === String(filters.product_id)
    );
    const selectedProductLabel = selectedProduct?.title
        ? selectedProduct.title
        : filters.product_id || null;

    // Coupon search debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value) => {
            onSearchChange(value);
        }, 500),
        [onSearchChange]
    );

    useEffect(() => {
        setSearchValue(filters.search || '');
    }, [filters.search]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    // Product picker search debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedProductSearch = useCallback(
        debounce((value) => {
            onProductSearchChange?.(value);
        }, 400),
        [onProductSearchChange]
    );

    useEffect(() => {
        setProductSearchValue(productSearch || '');
    }, [productSearch]);

    const handleProductSearchChange = (e) => {
        const value = e.target.value;
        setProductSearchValue(value);
        debouncedProductSearch(value);
    };

    const handleSelectProduct = (product) => {
        onProductFilterChange?.(product);
        setProductDropdownOpen(false);
    };

    // Focus the product search input when dropdown opens
    useEffect(() => {
        if (productDropdownOpen) {
            setTimeout(() => productSearchInputRef.current?.focus(), 50);
        }
    }, [productDropdownOpen]);

    // Date range: convert from/to Date objects → 'yyyy-MM-dd' strings
    const handleDateRangeChange = (range) => {
        onStartDateChange?.(range?.from ? format(range.from, 'yyyy-MM-dd') : '');
        onEndDateChange?.(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
    };

    const clearDateFilters = () => {
        onStartDateChange?.('');
        onEndDateChange?.('');
    };

    const dateRangeValue = {
        from: filters.startDate ? new Date(filters.startDate) : undefined,
        to: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    const dateLabel = filters.startDate ? (
        filters.endDate ? (
            <>
                {format(new Date(filters.startDate), 'LLL dd, y', { locale: isRtl ? arSA : undefined })}{' – '}
                {format(new Date(filters.endDate), 'LLL dd, y', { locale: isRtl ? arSA : undefined })}
            </>
        ) : (
            format(new Date(filters.startDate), 'LLL dd, y', { locale: isRtl ? arSA : undefined })
        )
    ) : (
        <span className="text-muted-foreground">{t('coupons.filters.date.range', 'Filter by date')}</span>
    );

    const totalPages = Math.max(1, Math.ceil((productPagination?.total || 0) / (productPagination?.limit || 1)));

    return (
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 mb-6" data-testid="coupons-filters">

            {/* Search */}
            <div className="relative md:w-2xl w-xs shrink-0">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('coupons.searchPlaceholder')}
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="ps-10"
                    data-testid="coupons-filters-search-input"
                />
            </div>

            {/* Active status */}
            <Select dir={i18n.dir()} value={filters.active || 'all'} onValueChange={onActiveChange}>
                <SelectTrigger className="w-36 shrink-0" data-testid="coupons-filters-active-select-trigger">
                    <SelectValue placeholder={t('coupons.filters.active.label')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" data-testid="coupons-filters-active-all">
                        {t('coupons.filters.active.all')}
                    </SelectItem>
                    <SelectItem value="true" data-testid="coupons-filters-active-true">
                        {t('coupons.filters.active.active')}
                    </SelectItem>
                    <SelectItem value="false" data-testid="coupons-filters-active-false">
                        {t('coupons.filters.active.inactive')}
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Discount type */}
            <Select dir={i18n.dir()} value={filters.discount_type || 'all'} onValueChange={onDiscountTypeChange}>
                <SelectTrigger className="w-36 shrink-0" data-testid="coupons-filters-type-select-trigger">
                    <SelectValue placeholder={t('coupons.filters.type.label')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" data-testid="coupons-filters-type-all">
                        {t('coupons.filters.type.all')}
                    </SelectItem>
                    <SelectItem value="PERCENTAGE" data-testid="coupons-filters-type-percentage">
                        {t('coupons.filters.type.percentage')}
                    </SelectItem>
                    <SelectItem value="AMOUNT" data-testid="coupons-filters-type-amount">
                        {t('coupons.filters.type.amount')}
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Date range — single popover with mode="range" */}
            <div className="flex items-center gap-1 shrink-0" data-testid="coupons-filters-date-range">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            id="coupon-date-range"
                            className={cn(
                                'w-56 justify-start text-start font-normal',
                                !filters.startDate && 'text-muted-foreground'
                            )}
                            data-testid="coupons-filters-date-range-button"
                        >
                            <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
                            <span className="truncate">{dateLabel}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRangeValue.from}
                            selected={dateRangeValue}
                            onSelect={handleDateRangeChange}
                            numberOfMonths={2}
                            locale={isRtl ? arSA : undefined}
                            dir={isRtl ? 'rtl' : 'ltr'}
                        />
                    </PopoverContent>
                </Popover>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={clearDateFilters}
                    disabled={!filters.startDate && !filters.endDate}
                    data-testid="coupons-filters-date-clear-button"
                    title={t('coupons.filters.date.clear', 'Clear dates')}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Product picker — inline dropdown with search */}
            <div className="flex items-center gap-1 shrink-0">
                <Popover open={productDropdownOpen} onOpenChange={setProductDropdownOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'w-48 justify-between text-start font-normal',
                                !selectedProductLabel && 'text-muted-foreground'
                            )}
                            data-testid="coupons-product-picker-open-button"
                        >
                            <span className="truncate">
                                {selectedProductLabel || t('coupons.filters.product.placeholder')}
                            </span>
                            <ChevronDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="start" data-testid="coupons-product-picker-dropdown">
                        {/* Search inside dropdown */}
                        <div className="relative mb-2">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={productSearchInputRef}
                                value={productSearchValue}
                                onChange={handleProductSearchChange}
                                placeholder={t('coupons.productPicker.searchPlaceholder')}
                                className="ps-10 h-8 text-sm"
                                data-testid="coupons-product-picker-search-input"
                            />
                        </div>

                        {/* Product list */}
                        <div className="rounded-md border max-h-64 overflow-y-auto" data-testid="coupons-product-picker-list">
                            {productsLoading ? (
                                <div className="h-24 flex items-center justify-center">
                                    <LoadingSpinner className="h-5 w-5 text-primary" />
                                </div>
                            ) : products?.length ? (
                                <div className="divide-y">
                                    {products.map((product) => {
                                        const productId = getProductId(product);
                                        const isSelected = String(productId) === String(filters.product_id);
                                        return (
                                            <button
                                                key={productId}
                                                type="button"
                                                onClick={() => handleSelectProduct(product)}
                                                className={cn(
                                                    'w-full p-2.5 flex items-center justify-between gap-2 text-start hover:bg-accent transition-colors',
                                                    isSelected && 'bg-accent'
                                                )}
                                                data-testid={`coupons-product-picker-item-${productId}`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{product.title || t('common.na')}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {formatCurrency(product.price_after_discount ?? product.price, t)}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-xs text-primary font-medium shrink-0">
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground" data-testid="coupons-product-picker-empty">
                                    {t('coupons.productPicker.empty')}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t text-xs text-muted-foreground">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    disabled={(productPagination?.page || 1) <= 1}
                                    onClick={() => onProductPageChange?.(Math.max(1, (productPagination?.page || 1) - 1))}
                                    data-testid="coupons-product-picker-pagination-prev"
                                >
                                    {t('common.pagination.previous')}
                                </Button>
                                <span>{productPagination?.page || 1} / {totalPages}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    disabled={(productPagination?.page || 1) >= totalPages}
                                    onClick={() => onProductPageChange?.(Math.min(totalPages, (productPagination?.page || 1) + 1))}
                                    data-testid="coupons-product-picker-pagination-next"
                                >
                                    {t('common.pagination.next')}
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => onProductFilterClear?.()}
                    disabled={!filters.product_id}
                    data-testid="coupons-filters-product-clear-button"
                    title={t('coupons.filters.product.clear')}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
