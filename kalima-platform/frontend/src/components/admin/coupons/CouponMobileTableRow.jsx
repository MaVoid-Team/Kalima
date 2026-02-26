/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import CouponMobileActions from '@/components/admin/coupons/CouponMobileActions';

const getCouponId = (coupon) => coupon?.id || coupon?._id;
const isCouponActive = (coupon) => coupon?.is_active ?? coupon?.active ?? false;

const getDiscountType = (coupon) => {
    if (coupon?.discount_type === 'PERCENTAGE' || coupon?.discount_type === 'AMOUNT') {
        return coupon.discount_type;
    }

    const amount = Number(coupon?.discount_amount ?? 0);
    return amount > 0 ? 'AMOUNT' : 'PERCENTAGE';
};

const formatDiscount = (coupon, t, i18n) => {
    if (getDiscountType(coupon) === 'PERCENTAGE') {
        return `${i18n.language === 'ar' ? '%' : ''}${coupon.discount_percentage ?? 0}${i18n.language === 'en' ? '%' : ''}`;
    }

    return `${coupon?.discount_amount ?? '—'} ${t('coupons.form.units.amount')}`;
};

export default function CouponMobileTableRow({ coupon, onEdit, onDelete, onToggleActivation }) {
    const { t, i18n } = useTranslation('admin');
    const couponId = getCouponId(coupon);
    const active = isCouponActive(coupon);
    const discountType = getDiscountType(coupon);

    return (
        <TableRow data-testid={`coupons-mobile-row-${couponId}`}>
            <TableCell className="align-top">
                <div className="space-y-1.5 min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t('coupons.table.code')}
                    </p>
                    <p className="font-semibold truncate leading-none">{coupon.code || '—'}</p>
                    {active ? (
                        <Badge className="text-[10px] w-fit">{t('coupons.status.active')}</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] w-fit">{t('coupons.status.inactive')}</Badge>
                    )}
                </div>
            </TableCell>

            <TableCell className="align-top">
                <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                        <Badge
                            variant="secondary"
                            className={discountType === 'PERCENTAGE'
                                ? 'bg-chart-2/15 text-chart-2 border border-chart-2/30'
                                : 'bg-chart-4/15 text-chart-4 border border-chart-4/30'}
                        >
                            {discountType === 'PERCENTAGE'
                                ? t('coupons.discountType.percentage')
                                : t('coupons.discountType.amount')}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">
                            {formatDiscount(coupon, t, i18n)}
                        </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate">
                        {t('coupons.table.productId')}: <span className="text-foreground font-medium">{coupon.product_id || '—'}</span>
                    </p>
                </div>
            </TableCell>

            <TableCell className="align-top text-end">
                <CouponMobileActions
                    coupon={coupon}
                    couponId={couponId}
                    active={active}
                    onToggleActivation={onToggleActivation}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </TableCell>
        </TableRow>
    );
}
