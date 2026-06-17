/* eslint-disable react/prop-types */

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function EditCouponDiscountFields({ form, discountType, t }) {
    return (
        <>
            <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('coupons.form.discountType')}</FormLabel>
                        <FormControl>
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-2 gap-4"
                                data-testid="coupons-edit-discount-type"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="PERCENTAGE" id="edit-discount-percentage" />
                                    <Label htmlFor="edit-discount-percentage">
                                        {t('coupons.discountType.percentage')}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="AMOUNT" id="edit-discount-amount" />
                                    <Label htmlFor="edit-discount-amount">
                                        {t('coupons.discountType.amount')}
                                    </Label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {discountType === 'PERCENTAGE' ? (
                <FormField
                    control={form.control}
                    name="discount_percentage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {`${t('coupons.form.discountPercentage')} (${t('coupons.form.units.percentage')})`}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={3}
                                        {...field}
                                        value={field.value ?? ''}
                                        className="pe-10"
                                        data-testid="coupons-edit-discount-percentage-input"
                                    />
                                    <span
                                        className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground"
                                        data-testid="coupons-edit-discount-percentage-suffix"
                                    >
                                        {t('coupons.form.units.percentage')}
                                    </span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ) : (
                <FormField
                    control={form.control}
                    name="discount_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {`${t('coupons.form.discountAmount')} (${t('coupons.form.units.amount')})`}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        {...field}
                                        value={field.value ?? ''}
                                        className="pe-14"
                                        data-testid="coupons-edit-discount-amount-input"
                                    />
                                    <span
                                        className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground"
                                        data-testid="coupons-edit-discount-amount-suffix"
                                    >
                                        {t('coupons.form.units.amount')}
                                    </span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </>
    );
}
