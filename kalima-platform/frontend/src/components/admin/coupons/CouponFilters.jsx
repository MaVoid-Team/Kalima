/* eslint-disable react/prop-types */

import { Search, Calendar as CalendarIcon, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import ProductPickerDialog from './ProductPickerDialog';

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
    const [pickerOpen, setPickerOpen] = useState(false);
    const isRtl = i18n.language?.startsWith('ar');

    const selectedProduct = products?.find(
        (product) => String(getProductId(product)) === String(filters.product_id)
    );
    const selectedProductLabel = selectedProduct?.title
        ? `${selectedProduct.title} (${filters.product_id})`
        : filters.product_id || '';

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

    const handleSelectProduct = (product) => {
        onProductFilterChange?.(product);
        setPickerOpen(false);
    };

    const clearDateFilters = () => {
        onStartDateChange?.('');
        onEndDateChange?.('');
    };

    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6" data-testid="coupons-filters">
            <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('coupons.searchPlaceholder')}
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="ps-10"
                    data-testid="coupons-filters-search-input"
                />
            </div>

            <Select dir={i18n.dir()} value={filters.active || 'all'} onValueChange={onActiveChange}>
                <SelectTrigger className="w-full sm:w-45" data-testid="coupons-filters-active-select-trigger">
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

            <Select dir={i18n.dir()} value={filters.discount_type || 'all'} onValueChange={onDiscountTypeChange}>
                <SelectTrigger className="w-full sm:w-45" data-testid="coupons-filters-type-select-trigger">
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

            <div className="flex items-center gap-2 w-full flex-nowrap min-w-0" data-testid="coupons-filters-date-range">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'flex-1 min-w-0 sm:flex-none sm:w-auto sm:min-w-37.5 justify-start text-start font-normal',
                                !filters.startDate && 'text-muted-foreground'
                            )}
                            data-testid="coupons-filters-start-date-input"
                        >
                            <CalendarIcon className="me-2 h-4 w-4" />
                            {filters.startDate
                                ? format(new Date(filters.startDate), 'PP', { locale: isRtl ? arSA : undefined })
                                : t('coupons.filters.date.start')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={filters.startDate ? new Date(filters.startDate) : undefined}
                            onSelect={(date) => onStartDateChange?.(date ? format(date, 'yyyy-MM-dd') : '')}
                            locale={isRtl ? arSA : undefined}
                            dir={isRtl ? 'rtl' : 'ltr'}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <span className="text-muted-foreground text-sm inline-flex justify-center shrink-0">
                    {i18n.language === 'ar' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                </span>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                'flex-1 min-w-0 sm:flex-none sm:w-auto sm:min-w-37.5 justify-start text-start font-normal',
                                !filters.endDate && 'text-muted-foreground'
                            )}
                            data-testid="coupons-filters-end-date-input"
                        >
                            <CalendarIcon className="me-2 h-4 w-4" />
                            {filters.endDate
                                ? format(new Date(filters.endDate), 'PP', { locale: isRtl ? arSA : undefined })
                                : t('coupons.filters.date.end')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={filters.endDate ? new Date(filters.endDate) : undefined}
                            onSelect={(date) => onEndDateChange?.(date ? format(date, 'yyyy-MM-dd') : '')}
                            locale={isRtl ? arSA : undefined}
                            dir={isRtl ? 'rtl' : 'ltr'}
                            initialFocus
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
                    title={t('coupons.filters.product.clear')}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:flex-nowrap sm:w-auto sm:min-w-88">
                <Input
                    value={selectedProductLabel}
                    readOnly
                    placeholder={t('coupons.filters.product.placeholder')}
                    className="min-w-0 flex-1"
                    data-testid="coupons-filters-product-input"
                />
                <ProductPickerDialog
                    open={pickerOpen}
                    onOpenChange={setPickerOpen}
                    products={products}
                    pagination={productPagination}
                    loading={productsLoading}
                    search={productSearch}
                    onSearchChange={onProductSearchChange}
                    onPageChange={onProductPageChange}
                    onSelect={handleSelectProduct}
                    selectedProductId={filters.product_id}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onProductFilterClear?.()}
                    disabled={!filters.product_id}
                    data-testid="coupons-filters-product-clear-button"
                >
                    {t('coupons.filters.product.clear')}
                </Button>
            </div>
        </div>
    );
}
