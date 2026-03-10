import { useState, useCallback } from 'react';
import useApiMutation from './useApiMutation';

/**
 * Custom hook for managing product reviews
 * Handles review eligibility checking, creation, updating, and deletion
 */
export const useReviews = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
    const [loading, setLoading] = useState(false);

    /**
     * Check if user can review a product
     * @param {string|number} productId - Product ID
     * @returns {Promise<{canReview: boolean, reason?: string}>}
     */
    const checkReviewEligibility = useCallback(async (productId) => {
        try {
            const data = await fetchApi({
                endpoint: `/products/${productId}/reviews/can-review`,
                method: 'get'
            });
            return data?.data || { canReview: false, reason: 'unknown' };
        } catch (error) {
            console.error('Failed to check review eligibility:', error);
            return { canReview: false, reason: 'error' };
        }
    }, [fetchApi]);

    /**
     * Create a new review for a product
     * @param {string|number} productId - Product ID
     * @param {Object} reviewData - Review data
     * @param {number} reviewData.rating - Rating (1-5)
     * @param {string} reviewData.review_text - Review text (optional, max 2000 chars)
     * @returns {Promise<Object>} Created review data
     */
    const createReview = useCallback(async (productId, reviewData) => {
        setLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/products/${productId}/reviews`,
                method: 'post',
                data: reviewData,
                defaultSuccessMessage: 'Review created successfully'
            });
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchApi]);

    /**
     * Update an existing review
     * @param {string|number} productId - Product ID
     * @param {string|number} reviewId - Review ID
     * @param {Object} reviewData - Updated review data
     * @param {number} reviewData.rating - Rating (1-5)
     * @param {string} reviewData.review_text - Review text (optional, max 2000 chars)
     * @returns {Promise<Object>} Updated review data
     */
    const updateReview = useCallback(async (productId, reviewId, reviewData) => {
        setLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/products/${productId}/reviews/${reviewId}`,
                method: 'patch',
                data: reviewData,
                defaultSuccessMessage: 'Review updated successfully'
            });
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchApi]);

    /**
     * Delete a review
     * @param {string|number} productId - Product ID
     * @param {string|number} reviewId - Review ID
     * @returns {Promise<Object>} Deletion response
     */
    const deleteReview = useCallback(async (productId, reviewId) => {
        setLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/products/${productId}/reviews/${reviewId}`,
                method: 'delete',
                defaultSuccessMessage: 'Review deleted successfully'
            });
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchApi]);

    return {
        checkReviewEligibility,
        createReview,
        updateReview,
        deleteReview,
        loading: loading || apiLoading
    };
};
