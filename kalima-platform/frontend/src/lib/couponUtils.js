/**
 * @typedef {Object} CouponData
 * @property {string} code
 * @property {'PERCENTAGE' | 'AMOUNT'} discount_type
 * @property {number} [discount_percentage]
 * @property {number} [discount_amount]
 * @property {string} product_id
 * @property {string} starts_at ISO-8601 date string (e.g. 2026-01-01T00:00:00.000Z)
 * @property {string} expires_at ISO-8601 date string (e.g. 2026-06-01T00:00:00.000Z)
 * @property {boolean} [is_active]
 */


/**
     * @param {CouponData} couponData - The data for the new coupon.
     * @example
     * {
     *   "code": "KLM-B685D6",
     *   "discount_type": "PERCENTAGE",
     *   "discount_percentage": 20,
     *   "discount_amount": 0,
     *   "product_id": "{{productId}}",
     *   "starts_at": "2026-01-01T00:00:00.000Z",
     *   "expires_at": "2026-06-01T00:00:00.000Z"
     * }
*/
export const getDiscountType = (coupon) => {
    if (coupon?.discount_type === 'PERCENTAGE' || coupon?.discount_type === 'AMOUNT') {
        return coupon.discount_type;
    }

    const amount = Number(coupon?.discount_amount ?? 0);
    return amount > 0 ? 'AMOUNT' : 'PERCENTAGE';
};

export const getCouponId = (coupon) => coupon?.id || coupon?._id;


export const isCouponActive = (coupon) => coupon?.is_active ?? coupon?.active ?? false;


export const formatDiscount = (coupon, t, i18n) => {
    if (getDiscountType(coupon) === 'PERCENTAGE') {
        return `${i18n.language === 'ar' ? '%' : ''}${coupon.discount_percentage ?? 0}${i18n.language === 'en' ? '%' : ''}`;
    }

    return `${coupon?.discount_amount ?? '—'} ${t('coupons.form.units.amount')}`;
};

