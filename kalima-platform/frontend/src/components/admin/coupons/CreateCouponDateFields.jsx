/* eslint-disable react/prop-types */

import EditCouponDateField from '@/components/admin/coupons/EditCouponDateField';

export default function CreateCouponDateFields({
    form,
    t,
    isRtl,
    selectedStartsDate,
    selectedExpiryDate,
}) {
    return (
        <>
            <EditCouponDateField
                form={form}
                name="starts_at"
                label={`${t('coupons.form.startsAt')} (${t('coupons.form.optional')})`}
                placeholder={t('coupons.form.startsAtPlaceholder')}
                selectedDate={selectedStartsDate}
                isRtl={isRtl}
                testId="coupons-create-starts-at-input"
            />

            <EditCouponDateField
                form={form}
                name="expires_at"
                label={t('coupons.form.expiresAt')}
                placeholder={t('coupons.form.expiresAtPlaceholder')}
                selectedDate={selectedExpiryDate}
                isRtl={isRtl}
                testId="coupons-create-expires-at-input"
            />
        </>
    );
}
