/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RefreshCw } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EditCouponDiscountFields from '@/components/admin/coupons/EditCouponDiscountFields';
import EditCouponProductField from '@/components/admin/coupons/EditCouponProductField';
import EditCouponDateField from '@/components/admin/coupons/EditCouponDateField';
import EditCouponActiveField from '@/components/admin/coupons/EditCouponActiveField';
import { getDiscountType as inferDiscountType, getCouponId } from '@/lib/couponUtils';

const getProductId = (product) => product?.id || product?._id;
const getProductPrice = (product) => {
    if (!product) return undefined;
    const parsed = Number(product.price);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const toNumberOrUndefined = (value) => {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export default function EditCouponDialog({
    open,
    onOpenChange,
    coupon,
    loading,
    onGenerateCode,
    onSubmitCoupon,
    onSuccess,
    products,
    productPagination,
    productsLoading,
    productSearch,
    onProductSearchChange,
    onProductPageChange,
}) {
    const { t, i18n } = useTranslation('admin');
    const [pickerOpen, setPickerOpen] = useState(false);
    const isRtl = i18n.language?.startsWith('ar');

    const schema = z
        .object({
            code: z
                .string()
                .trim()
                .min(6, t('coupons.validation.codeMinLength'))
                .regex(/^[A-Z0-9-]+$/, t('coupons.validation.codeFormat')),
            discount_type: z.enum(['PERCENTAGE', 'AMOUNT'], {
                required_error: t('coupons.validation.discountTypeRequired'),
                invalid_type_error: t('coupons.validation.discountTypeRequired'),
            }),
            discount_percentage: z.preprocess(
                (value) => {
                    if (value === '' || value === null || value === undefined) return undefined;
                    const parsed = Number(value);
                    return Number.isNaN(parsed) ? NaN : parsed;
                },
                z
                    .number({ invalid_type_error: t('coupons.validation.discountPercentageInvalid') })
                    .positive(t('coupons.validation.discountValuePositive'))
                    .optional()
            ),
            discount_amount: z.preprocess(
                (value) => {
                    if (value === '' || value === null || value === undefined) return undefined;
                    const parsed = Number(value);
                    return Number.isNaN(parsed) ? NaN : parsed;
                },
                z
                    .number({ invalid_type_error: t('coupons.validation.discountAmountInvalid') })
                    .positive(t('coupons.validation.discountValuePositive'))
                    .optional()
            ),
            product_id: z.string().min(1, t('coupons.validation.productRequired')),
            starts_at: z.string().optional(),
            expires_at: z.string().min(1, t('coupons.validation.expiresAtRequired')),
            active: z.boolean(),
        })
        .superRefine((values, ctx) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (values.discount_type === 'PERCENTAGE') {
                if (values.discount_percentage === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['discount_percentage'],
                        message: t('coupons.validation.discountPercentageRequired'),
                    });
                } else if (values.discount_percentage > 100) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['discount_percentage'],
                        message: t('coupons.validation.discountPercentageMax'),
                    });
                }
            }

            if (values.discount_type === 'AMOUNT' && values.discount_amount === undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['discount_amount'],
                    message: t('coupons.validation.discountAmountRequired'),
                });
            }

            if (values.discount_type === 'AMOUNT' && values.discount_amount !== undefined) {
                const selectedProduct = products?.find(
                    (product) => String(getProductId(product)) === String(values.product_id)
                );
                const productPrice = getProductPrice(selectedProduct);

                if (productPrice !== undefined && values.discount_amount > productPrice) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['discount_amount'],
                        message: t('coupons.validation.discountAmountExceedsProductPrice'),
                    });
                }
            }

            const startsAtDate = values.starts_at ? new Date(values.starts_at) : null;
            const expiresAtDate = values.expires_at ? new Date(values.expires_at) : null;

            if (
                expiresAtDate
                && !Number.isNaN(expiresAtDate.getTime())
                && expiresAtDate < today
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['expires_at'],
                    message: t('coupons.validation.expiresAtNotPast'),
                });
            }

            if (
                startsAtDate
                && expiresAtDate
                && !Number.isNaN(startsAtDate.getTime())
                && !Number.isNaN(expiresAtDate.getTime())
                && startsAtDate >= expiresAtDate
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['starts_at'],
                    message: t('coupons.validation.startsAtBeforeExpiresAt'),
                });
            }
        });

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            code: '',
            discount_type: 'PERCENTAGE',
            discount_percentage: undefined,
            discount_amount: undefined,
            product_id: '',
            starts_at: '',
            expires_at: '',
            active: true,
        },
        mode: 'onChange',
    });

    const discountType = form.watch('discount_type');
    const selectedProductId = form.watch('product_id');
    const selectedStartsDate = form.watch('starts_at');
    const selectedExpiryDate = form.watch('expires_at');
    const selectedProduct = products?.find((product) => String(getProductId(product)) === String(selectedProductId));
    const selectedProductLabel = selectedProduct?.title
        ? `${selectedProduct.title} (${selectedProductId})`
        : selectedProductId || '';

    useEffect(() => {
        if (!coupon) return;

        const resolvedDiscountType = inferDiscountType(coupon);

        form.reset({
            code: coupon.code || '',
            discount_type: resolvedDiscountType,
            discount_percentage: resolvedDiscountType === 'PERCENTAGE'
                ? toNumberOrUndefined(coupon.discount_percentage)
                : undefined,
            discount_amount: resolvedDiscountType === 'AMOUNT'
                ? toNumberOrUndefined(coupon.discount_amount)
                : undefined,
            product_id: coupon.product_id !== null && coupon.product_id !== undefined
                ? String(coupon.product_id)
                : '',
            starts_at: coupon.starts_at || coupon.startsAt || '',
            expires_at: coupon.expires_at || '',
            active: coupon.active ?? true,
        });
    }, [coupon, form]);

    useEffect(() => {
        if (discountType === 'PERCENTAGE') {
            form.setValue('discount_amount', undefined, { shouldValidate: true });
        } else {
            form.setValue('discount_percentage', undefined, { shouldValidate: true });
        }
    }, [discountType, form]);

    const onSubmit = async (values) => {
        const couponId = getCouponId(coupon);
        if (!couponId) return;

        const payload = {
            code: values.code,
            discount_type: values.discount_type,
            product_id: values.product_id,
            is_active: values.active,
            ...(values.starts_at ? { starts_at: new Date(values.starts_at).toISOString() } : {}),
            ...(values.expires_at ? { expires_at: new Date(values.expires_at).toISOString() } : {}),
            ...(values.discount_type === 'PERCENTAGE'
                ? { discount_percentage: values.discount_percentage }
                : { discount_amount: values.discount_amount }),
        };

        const result = await onSubmitCoupon(couponId, payload);
        if (result) {
            onOpenChange(false);
            onSuccess?.();
        }
    };

    const handleSelectProduct = (product) => {
        const productId = getProductId(product);
        if (!productId) return;

        form.setValue('product_id', String(productId), {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
        });
        setPickerOpen(false);
    };

    const handleGenerateCode = async () => {
        const generatedCode = await onGenerateCode?.();
        if (generatedCode) {
            form.setValue('code', generatedCode, { shouldDirty: true, shouldValidate: true });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar" data-testid="coupons-edit-sheet">
                <DialogHeader>
                    <DialogTitle>{t('coupons.edit.title')}</DialogTitle>
                    <DialogDescription>{t('coupons.edit.description')}</DialogDescription>
                </DialogHeader>

                <div className="p-4 pt-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('coupons.form.code')}</FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('coupons.form.codePlaceholder')}
                                                    data-testid="coupons-edit-code-input"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleGenerateCode}
                                                disabled={loading}
                                                className="w-full sm:w-auto"
                                                data-testid="coupons-edit-generate-code-button"
                                            >
                                                <RefreshCw className="me-2 h-4 w-4" />
                                                {t('coupons.actions.generateCode')}
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <EditCouponDiscountFields form={form} discountType={discountType} t={t} />

                            <EditCouponProductField
                                form={form}
                                t={t}
                                pickerOpen={pickerOpen}
                                setPickerOpen={setPickerOpen}
                                products={products}
                                productPagination={productPagination}
                                productsLoading={productsLoading}
                                productSearch={productSearch}
                                onProductSearchChange={onProductSearchChange}
                                onProductPageChange={onProductPageChange}
                                onSelectProduct={handleSelectProduct}
                                selectedProductId={selectedProductId}
                                selectedProductLabel={selectedProductLabel}
                                selectedProduct={selectedProduct}
                            />

                            <EditCouponDateField
                                form={form}
                                name="starts_at"
                                label={`${t('coupons.form.startsAt')} (${t('coupons.form.optional')})`}
                                placeholder={t('coupons.form.startsAtPlaceholder')}
                                selectedDate={selectedStartsDate}
                                isRtl={isRtl}
                                testId="coupons-edit-starts-at-input"
                            />

                            <EditCouponDateField
                                form={form}
                                name="expires_at"
                                label={t('coupons.form.expiresAt')}
                                placeholder={t('coupons.form.expiresAtPlaceholder')}
                                selectedDate={selectedExpiryDate}
                                isRtl={isRtl}
                                testId="coupons-edit-expires-at-input"
                            />

                            <EditCouponActiveField form={form} t={t} />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                    data-testid="coupons-edit-cancel-button"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !form.formState.isDirty}
                                    data-testid="coupons-edit-submit-button"
                                >
                                    {loading ? <LoadingSpinner className="h-4 w-4" /> : t('coupons.actions.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
