/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import CouponDateInfo from '@/components/admin/coupons/CouponDateInfo';
import CouponRowActions from '@/components/admin/coupons/CouponRowActions';
import { getDiscountType, getCouponId, isCouponActive, formatDiscount } from '@/lib/couponUtils';


export default function CouponTableRow({ coupon, onEdit, onDelete, onToggleActivation, isSelected, onSelect }) {
    const { t, i18n } = useTranslation('admin');
    const couponId = getCouponId(coupon);
    const active = isCouponActive(coupon);
    const discountType = getDiscountType(coupon);

    return (
        <TableRow data-testid={`coupons-table-row-${couponId}`} className={isSelected ? 'bg-muted/40' : ''}>
            <TableCell className="w-10">
                <Checkbox
                    className={i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}
                    checked={!!isSelected}
                    onCheckedChange={(checked) => onSelect?.(couponId, !!checked)}
                    aria-label={`Select coupon ${coupon.code}`}
                    data-testid={`coupons-table-row-checkbox-${couponId}`}
                />
            </TableCell>
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
