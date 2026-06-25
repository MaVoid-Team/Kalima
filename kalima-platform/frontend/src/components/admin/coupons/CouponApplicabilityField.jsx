/* eslint-disable react/prop-types */

import { useMemo } from 'react';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductPickerDialog from '@/components/admin/coupons/ProductPickerDialog';
import { formatCurrency } from '@/lib/storeUtils';
import { useCategories } from '@/hooks/useCategories';

const getProductId = (product) => product?.id || product?._id;

const flattenCategories = (categories, depth = 0) => categories.flatMap((category) => [
    {
        id: String(category.id),
        title: `${'— '.repeat(depth)}${category.title}`,
        active: category.active,
    },
    ...flattenCategories(Array.isArray(category.sub_categories) ? category.sub_categories : [], depth + 1),
]);

export default function CouponApplicabilityField({
    form,
    t,
    mode = 'create',
    pickerOpen,
    setPickerOpen,
    products,
    productPagination,
    productsLoading,
    productSearch,
    onProductSearchChange,
    onProductPageChange,
    onSelectProduct,
    selectedProductId,
    selectedProductLabel,
    selectedProduct,
}) {
    const { categories, loading: categoriesLoading } = useCategories();
    const scope = form.watch('applicability_scope');
    const categoryOptions = useMemo(() => flattenCategories(categories || []), [categories]);

    const handleScopeChange = (value) => {
        form.setValue('applicability_scope', value, { shouldDirty: true, shouldValidate: true });
        if (value === 'product') {
            form.setValue('category_id', '', { shouldDirty: true, shouldValidate: true });
        } else {
            form.setValue('product_id', '', { shouldDirty: true, shouldValidate: true });
        }
    };

    return (
        <div className="rounded-md border p-3 space-y-3" data-testid={`coupons-${mode}-applicability`}>
            <FormField
                control={form.control}
                name="applicability_scope"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('coupons.form.appliesTo')}</FormLabel>
                        <Select value={field.value} onValueChange={handleScopeChange}>
                            <FormControl>
                                <SelectTrigger data-testid={`coupons-${mode}-scope-select`}>
                                    <SelectValue placeholder={t('coupons.form.appliesToPlaceholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="product">{t('coupons.scope.product')}</SelectItem>
                                <SelectItem value="category">{t('coupons.scope.category')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {scope === 'category' ? (
                <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('coupons.form.categoryId')}</FormLabel>
                            <Select value={field.value || ''} onValueChange={field.onChange} disabled={categoriesLoading}>
                                <FormControl>
                                    <SelectTrigger data-testid={`coupons-${mode}-category-select`}>
                                        <SelectValue placeholder={t('coupons.form.categoryIdPlaceholder')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-72">
                                    {categoryOptions.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {t('coupons.form.categoryScopeHint')}
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ) : (
                <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('coupons.form.productId')}</FormLabel>
                            <div className="flex gap-2 flex-col sm:flex-row" data-testid={`coupons-${mode}-product-picker`}>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={selectedProductLabel}
                                        readOnly
                                        placeholder={t('coupons.form.productIdPlaceholder')}
                                        data-testid={`coupons-${mode}-product-id-input`}
                                    />
                                </FormControl>

                                <ProductPickerDialog
                                    open={pickerOpen}
                                    onOpenChange={setPickerOpen}
                                    products={products}
                                    pagination={productPagination}
                                    loading={productsLoading}
                                    search={productSearch}
                                    onSearchChange={onProductSearchChange}
                                    onPageChange={onProductPageChange}
                                    onSelect={onSelectProduct}
                                    selectedProductId={selectedProductId}
                                />
                            </div>

                            {!!selectedProduct && (
                                <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1" data-testid={`coupons-${mode}-selected-product-prices`}>
                                    <p className="text-muted-foreground">
                                        {t('coupons.productPicker.price')}: <span className="text-foreground font-medium">{formatCurrency(selectedProduct.price, t)}</span>
                                    </p>
                                    {selectedProduct.price_after_discount && Number(selectedProduct.price_after_discount) !== Number(selectedProduct.price) && (
                                        <p className="text-muted-foreground">
                                            {t('coupons.productPicker.priceAfterDiscount')}: <span className="text-foreground font-medium">{formatCurrency(selectedProduct.price_after_discount, t)}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}
