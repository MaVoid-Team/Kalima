import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import RatingDisplay from '@/components/ui/RatingDisplay';
import { useReviews } from '@/hooks/useReviews';
import useAuth from '@/hooks/auth/useAuth';

/**
 * ReviewList component - Manages and displays product reviews
 * 
 * @param {Object} props
 * @param {string|number} props.productId - Product ID
 * @param {number} props.averageRating - Average rating from product data
 * @param {number} props.totalReviews - Total review count from product data
 * @param {Array} props.productReviews - Reviews array from product data
 * @param {string} props.className - Additional CSS classes
 */
const ReviewList = ({ productId, averageRating, totalReviews, productReviews = [], className }) => {
  const { t } = useTranslation('product');
  const { isAuthenticated } = useAuth();
  const {
    checkReviewEligibility,
    createReview,
    updateReview,
    loading
  } = useReviews();

  const [reviews, setReviews] = useState(productReviews);
  const [canReview, setCanReview] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  
  // Initialize reviews from product data
  useEffect(() => {
    setReviews(productReviews);
  }, [productReviews]);

  // Check review eligibility
  useEffect(() => {
    if (isAuthenticated && productId) {
      checkReviewEligibility(productId)
        .then(result => {
          setCanReview(result.canReview);
          setReviewReason(result.reason);
        })
        .catch(err => {
          console.error('Failed to check review eligibility:', err);
          setCanReview(false);
          setReviewReason('error');
        });
    } else {
      setCanReview(false);
      setReviewReason('not_authenticated');
    }
  }, [isAuthenticated, productId, checkReviewEligibility]);

  const handleCreateReview = async (reviewData) => {
    try {
      const result = await createReview(productId, reviewData);
      if (result?.success) {
        // Add new review to the list
        setReviews(prev => [result.data, ...prev]);
        setShowForm(false);
        // Note: In a real implementation, you might want to refresh the product data
        // to get updated average rating and review count
      }
    } catch (err) {
      console.error('Failed to create review:', err);
      setError('Failed to submit review');
    }
  };

  const handleUpdateReview = async (reviewId, reviewData) => {
    try {
      const result = await updateReview(productId, reviewId, reviewData);
      if (result?.success) {
        // Update review in the list
        setReviews(prev => prev.map(review =>
          review.id === reviewId ? { ...review, ...result.data } : review
        ));
        setEditingReview(null);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to update review:', err);
      setError('Failed to update review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const isLoading = loading;

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const getReviewReasonMessage = (reason) => {
    switch (reason) {
      case 'no_confirmed_purchase':
        return t('reviews.reasons.noConfirmedPurchase', 'You can only review products you have purchased and that have been confirmed');
      case 'not_authenticated':
        return t('reviews.reasons.notAuthenticated', 'You must be logged in to write a review');
      case 'already_reviewed':
        return t('reviews.reasons.alreadyReviewed', 'You have already reviewed this product');
      default:
        return t('reviews.reasons.cannotReview', 'You cannot review this product');
    }
  };

  return (
    <div className={className} data-testid="review-list">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('reviews.title', 'Reviews')}
          </h2>
          {totalReviews > 0 && (
            <RatingDisplay
              rating={averageRating}
              reviewCount={totalReviews}
              size="md"
            />
          )}
        </div>

        {/* Write Review Button */}
        {isAuthenticated && (
          <Button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="w-full sm:w-auto"
            data-testid="write-review-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('reviews.writeReview', 'Write a Review')}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            initialRating={editingReview?.rating || 0}
            initialReviewText={editingReview?.review_text || ''}
            loading={loading}
            onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
            onCancel={handleCancelForm}
            submitText={editingReview ?
              t('reviews.updateReview', 'Update Review') :
              t('reviews.submitReview', 'Submit Review')
            }
          />
        </div>
      )}

      {/* Review Eligibility Message */}
      {!showForm && !canReview && isAuthenticated && (
        <Alert className="mb-6">
          <AlertDescription>
            {getReviewReasonMessage(reviewReason)}
          </AlertDescription>
        </Alert>
      )}

      {/* Login Prompt */}
      {!isAuthenticated && (
        <Alert className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <AlertDescription className="text-sm font-medium">
              {t('reviews.loginToReview', 'Please log in to write reviews')}
            </AlertDescription>
          </div>
          <Button asChild size="sm" className="shrink-0 w-full sm:w-auto shadow-sm">
            <Link to="/login" state={{from: location}} replace>
              {t('reviews.loginAction', 'Log in')}
            </Link>
          </Button>
        </Alert>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t('reviews.noReviews', 'No reviews yet')}
          </h3>
          <p className="text-muted-foreground">
            {t('reviews.beFirstToReview', 'Be the first to review this product')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwnReview={false} // This would be determined by comparing with current user's ID
              canEdit={false} // This would be determined by ownership and permissions
              onEdit={handleEditReview}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
