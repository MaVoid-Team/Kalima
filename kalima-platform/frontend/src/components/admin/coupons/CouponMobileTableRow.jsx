/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import CouponMobileActions from '@/components/admin/coupons/CouponMobileActions';
import { getDiscountType, getCouponId, isCouponActive, formatDiscount } from '@/lib/couponUtils';

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
