import { useCallback } from 'react';
import useApiMutation from '../useApiMutation';
import { useTranslation } from 'react-i18next';

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

export const useAdminCoupons = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
    const { t } = useTranslation('admin');

    const normalizeCouponsResponse = useCallback((rawData, params = {}) => {
        const list = Array.isArray(rawData)
            ? rawData
            : rawData?.coupons || rawData?.items || rawData?.data || [];

        const paginationSource = rawData?.pagination || {};
        const total = paginationSource.total ?? rawData?.total ?? list.length ?? 0;
        const limit = paginationSource.limit ?? rawData?.limit ?? params.limit ?? 10;
        const page = paginationSource.page ?? rawData?.page ?? params.page ?? 1;
        const pages =
            paginationSource.totalPages ??
            paginationSource.pages ??
            rawData?.pages ??
            Math.max(1, Math.ceil(total / Math.max(1, limit)));

        return {
            coupons: Array.isArray(list) ? list : [],
            pagination: {
                total,
                page,
                pages,
                limit,
            },
        };
    }, []);


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

    const getCouponsStats = useCallback(async () => {
        try {
            const res = await fetchApi({
                endpoint: '/coupons/stats',
                method: 'get'
            });
            if (res?.success) {
                return res.data;
            }
        } catch (error) {
            console.error('Failed to get coupons stats:', error);
            throw error;
        }
    }, [fetchApi]);

    const getAllCoupons = useCallback(async (params = {}) => {
        try {
            const { ...queryParams } = params;
            const query = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    query.append(key, String(value));
                }
            });

            const res = await fetchApi({
                endpoint: `/coupons${query.toString() ? `?${query.toString()}` : ''}`,
                method: 'get',
            });
            if (res?.success) {
                return normalizeCouponsResponse(res.data, params);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            throw error;
        }
    }, [fetchApi, normalizeCouponsResponse]);


    /**
     * @param {CouponData} couponData - The data for the new coupon.
     * @example
     * {
     *   "code": "KLM-B685D6",
     *   "discount_type": "PERCENTAGE",
     *   "discount_percentage": 20,
     *   "product_id": "{{productId}}",
    *   "starts_at": "2026-01-01T00:00:00.000Z",
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
     *   "discount_type": "AMOUNT",
     *   "discount_amount": 100,
     *   "product_id": "{{productId}}",
    *   "starts_at": "2026-01-01T00:00:00.000Z",
    *   "expires_at": "2026-06-01T00:00:00.000Z",
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
        getCouponsStats,
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
