/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getDiscountType, formatDiscount, formatCouponApplicability } from '@/lib/couponUtils';

const formatDateValue = (value, isRtl) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return format(date, 'PPP', { locale: isRtl ? arSA : undefined });
};

export default function CouponDetailsDialog({ open, onOpenChange, coupon }) {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language?.startsWith('ar');
    const active = coupon?.is_active ?? coupon?.active ?? false;
    const discountType = getDiscountType(coupon);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg custom-scrollbar" data-testid="coupon-details-dialog">
                <DialogHeader>
                    <DialogTitle>{t('coupons.details.title', { defaultValue: 'Coupon details' })}</DialogTitle>
                    <DialogDescription>{t('coupons.details.description', { defaultValue: 'Review coupon information and validity.' })}</DialogDescription>
                </DialogHeader>

                {coupon && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.code')}</span>
                            <span className="font-medium">{coupon.code || '—'}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.discountType')}</span>
                            <Badge variant="secondary">
                                {discountType === 'PERCENTAGE'
                                    ? t('coupons.discountType.percentage')
                                    : t('coupons.discountType.amount')}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.discountValue')}</span>
                            <span className="font-medium">{formatDiscount(coupon, t, i18n)}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.appliesTo')}</span>
                            <span className="font-medium">{formatCouponApplicability(coupon, t)}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.createdAt')}</span>
                            <span className="font-medium">{formatDateValue(coupon.created_at || coupon.createdAt, isRtl)}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.startsAt')}</span>
                            <span className="font-medium">{formatDateValue(coupon.starts_at || coupon.startsAt, isRtl)}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.expiresAt')}</span>
                            <span className="font-medium">{formatDateValue(coupon.expires_at || coupon.expiresAt, isRtl)}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-muted-foreground">{t('coupons.table.status')}</span>
                            {active ? (
                                <Badge>{t('coupons.status.active')}</Badge>
                            ) : (
                                <Badge variant="outline">{t('coupons.status.inactive')}</Badge>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
