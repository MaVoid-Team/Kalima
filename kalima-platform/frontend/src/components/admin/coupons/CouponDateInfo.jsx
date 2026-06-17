/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';

const formatDateValue = (value, isRtl) => {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return format(date, 'PPP', {
        locale: isRtl ? arSA : undefined,
    });
};

export default function CouponDateInfo({ coupon }) {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language?.startsWith('ar');

    return (
        <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1">
                <span className="inline-flex items-center rounded-sm border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {t('coupons.table.createdAt')}
                </span>
                <span className="font-medium text-foreground">
                    {formatDateValue(coupon.created_at || coupon.createdAt, isRtl)}
                </span>
            </div>

            {(coupon.starts_at || coupon.startsAt) && (
                <div className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1">
                    <span className="inline-flex items-center rounded-sm border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t('coupons.table.startsAt')}
                    </span>
                    <span className="font-medium text-foreground">
                        {formatDateValue(coupon.starts_at || coupon.startsAt, isRtl)}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1">
                <span className="inline-flex items-center rounded-sm border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {t('coupons.table.expiresAt')}
                </span>
                <span className="font-medium text-foreground">
                    {formatDateValue(coupon.expires_at || coupon.expiresAt, isRtl)}
                </span>
            </div>
        </div>
    );
}
