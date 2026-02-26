/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import CouponDateInfo from '@/components/admin/coupons/CouponDateInfo';
import CouponRowActions from '@/components/admin/coupons/CouponRowActions';

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

export default function CouponTableRow({ coupon, onEdit, onDelete, onToggleActivation }) {
    const { t, i18n } = useTranslation('admin');
    const couponId = getCouponId(coupon);
    const active = isCouponActive(coupon);
    const discountType = getDiscountType(coupon);

    return (
        <TableRow data-testid={`coupons-table-row-${couponId}`}>
            <TableCell className="font-medium">{coupon.code || '—'}</TableCell>

            <TableCell>
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
            </TableCell>

            <TableCell>{formatDiscount(coupon, t, i18n)}</TableCell>
            <TableCell>{coupon.product_id || '—'}</TableCell>

            <TableCell className="align-top">
                <CouponDateInfo coupon={coupon} />
            </TableCell>

            <TableCell>
                {active ? (
                    <Badge>{t('coupons.status.active')}</Badge>
                ) : (
                    <Badge variant="outline">{t('coupons.status.inactive')}</Badge>
                )}
            </TableCell>

            <TableCell>
                <CouponRowActions
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
