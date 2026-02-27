/* eslint-disable react/prop-types */

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ProductPickerDialog from '@/components/admin/coupons/ProductPickerDialog';
import { formatCurrency } from '@/lib/storeUtils';

export default function CreateCouponProductField({
    form,
    t,
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
    return (
        <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('coupons.form.productId')}</FormLabel>
                    <div className="flex gap-2 flex-col sm:flex-row" data-testid="coupons-create-product-picker">
                        <FormControl>
                            <Input
                                {...field}
                                value={selectedProductLabel}
                                readOnly
                                placeholder={t('coupons.form.productIdPlaceholder')}
                                data-testid="coupons-create-product-id-input"
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
                        <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1" data-testid="coupons-create-selected-product-prices">
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
    );
}
