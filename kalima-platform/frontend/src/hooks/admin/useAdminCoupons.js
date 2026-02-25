import { useCallback } from 'react';
import useApiMutation from '../useApiMutation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * @typedef {Object} CouponData
 * @property {string} code
 * @property {'percentage' | 'amount'} discount_type
 * @property {number} discount_percentage
 * @property {number} discount_amount
 * @property {string} product_id
 * @property {string} expires_at ISO-8601 date string (e.g. 2026-06-01T00:00:00.000Z)
 * @property {boolean} is_active
 */

export const useAdminCoupons = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
    const { t } = useTranslation('admin');


    const generateCouponCode = useCallback(async () => {
        try {
            const res = await fetchApi({
                endpoint: '/coupons/generate-code',
                method: 'get'
            });
            if (res?.success) {
                return res.data.code;
            }
        } catch (error) {
            console.error('Failed to generate coupon code:', error);
            throw error;
        }
    }, [fetchApi]);

    const getAllCoupons = useCallback(async () => {
        try {
            const res = await fetchApi({
                endpoint: '/coupons',
                method: 'get'
            });
            if (res?.success) {
                return res.data;
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            throw error;
        }
    }, [fetchApi]);


    /**
     * @param {CouponData} couponData - The data for the new coupon.
     * @example
     * {
     *   "code": "KLM-B685D6",
     *   "discount_type": "percentage",
     *   "discount_percentage": 20,
     *   "product_id": "{{productId}}",
     *   "expires_at": "2026-06-01T00:00:00.000Z"
     * }
     */
    const createCoupon = useCallback(async (couponData) => {
        try {
            const res = await fetchApi({
                endpoint: '/coupons',
                method: 'post',
                data: couponData
            });
            if (res?.success) {
                toast.success(t('coupons.api.createSuccess'));
                return res.data;
            }
        } catch (error) {
            console.error('Failed to create coupon:', error);
            throw error;
        }
    }, [fetchApi]);


    const getCouponById = useCallback(async (id) => {
        try {
            const res = await fetchApi({
                endpoint: `/coupons/${id}`,
                method: 'get'
            });
            if (res?.success) {
                return res.data;
            }
        } catch (error) {
            console.error('Failed to get coupon by ID:', error);
            throw error;
        }
    }, [fetchApi]);


    /**
     * @param {CouponData} couponData - The data for the new coupon.
     * @example
     * {
     *   "code": "KLM-B685D6",
     *   "discount_type": "amount",
     *   "discount_amount": 100,
     *   "product_id": "{{productId}}",
     *   "expires_at": "2026-06-01T00:00:00.000Z"
     *   "is_active": true
     * }
     */
    const updateCoupon = useCallback(async (id, couponData) => {
        try {
            const res = await fetchApi({
                endpoint: `/coupons/${id}`,
                method: 'patch',
                data: couponData
            });
            if (res?.success) {
                toast.success(t('coupons.api.updateSuccess'));
                return res.data;
            }
        } catch (error) {
            console.error('Failed to update coupon:', error);
            throw error;
        }
    }, [fetchApi]);

    const deleteCoupon = useCallback(async (id) => {
        try {
            const res = await fetchApi({
                endpoint: `/coupons/${id}`,
                method: 'delete'
            });
            if (res?.success) {
                toast.success(t('coupons.api.deleteSuccess'));
                return res.data;
            }
        } catch (error) {
            console.error('Failed to delete coupon:', error);
            throw error;
        }
    }, [fetchApi]);

    const validateCoupon = useCallback(async (code) => {
        try {
            const res = await fetchApi({
                endpoint: `/coupons/validate`,
                method: 'post',
                data: { code }
            });

            return res?.success;
        } catch (error) {
            console.error('Failed to validate coupon:', error);
            throw error;
        }
    }, [fetchApi]);

    return {
        generateCouponCode,
        getAllCoupons,
        createCoupon,
        getCouponById,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        apiLoading
    };
};

export default useAdminCoupons;
