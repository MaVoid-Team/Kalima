import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminReviewCard from './AdminReviewCard';
import useApiMutation from '@/hooks/useApiMutation';
import { cn } from '@/lib/utils';

/**
 * ReviewManager component - Manages product reviews for admin
 * 
 * @param {Object} props
 * @param {string|number} props.productId - Product ID
 * @param {string} props.className - Additional CSS classes
 */
const ReviewManager = ({ productId, className }) => {
  const { t } = useTranslation('admin');
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page,
        limit: pagination.limit
      });

      const data = await fetchApi({
        endpoint: `/products/${productId}/reviews?${query.toString()}`,
        method: 'get'
      });

      if (data?.success) {
        setReviews(data.data || []);
        setPagination(prev => ({
          ...prev,
          page: data.page || page,
          total: data.total || 0,
          pages: data.pages || 1
        }));
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, fetchApi, pagination.limit]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);

  const handleDeleteReview = async (review) => {
    try {
      const data = await fetchApi({
        endpoint: `/products/${productId}/reviews/${review.id}`,
        method: 'delete',
        defaultSuccessMessage: t('products.reviews.deleteSuccess', 'Review deleted successfully')
      });

      if (data?.success) {
        // Remove review from list
        setReviews(prev => prev.filter(r => r.id !== review.id));
        setPagination(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1)
        }));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review');
    }
  };

  const handlePageChange = (newPage) => {
    fetchReviews(newPage);
  };

  const isLoading = loading || apiLoading;

  return (
    <div className={className} data-testid="admin-review-manager">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('products.reviews.title', 'Reviews')}
          </h2>
          {pagination.total > 0 && (
            <Badge variant="secondary" className="text-sm">
              {pagination.total} {t('products.reviews.totalReviews', 'total reviews')}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchReviews()}
          disabled={isLoading}
          data-testid="admin-reviews-refresh"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !error ? (
        /* Empty State */
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('products.reviews.noReviews', 'No reviews yet')}
          </h3>
          <p className="text-muted-foreground">
            {t('products.reviews.noReviewsDescription', 'This product has not received any customer reviews yet.')}
          </p>
        </div>
      ) : (
        /* Reviews List */
        <div className="space-y-4">
          {reviews.map((review) => (
            <AdminReviewCard
              key={review.id}
              review={review}
              onDelete={handleDeleteReview}
              loading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
            data-testid="admin-reviews-prev"
          >
            {t('common.pagination.previous', 'Previous')}
          </Button>

          <span className="text-sm text-muted-foreground">
            {t('common.pagination.page', 'Page')} {pagination.page} {t('common.pagination.of', 'of')} {pagination.pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages || isLoading}
            data-testid="admin-reviews-next"
          >
            {t('common.pagination.next', 'Next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
