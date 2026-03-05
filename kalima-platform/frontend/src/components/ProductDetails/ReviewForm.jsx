import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * ReviewForm component - Form for creating/editing product reviews
 * 
 * @param {Object} props
 * @param {number} props.initialRating - Initial rating (for editing)
 * @param {string} props.initialReviewText - Initial review text (for editing)
 * @param {boolean} props.loading - Form submission loading state
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {string} props.submitText - Submit button text
 * @param {string} props.className - Additional CSS classes
 */
const ReviewForm = ({ 
  initialRating = 0, 
  initialReviewText = '', 
  loading = false, 
  onSubmit, 
  onCancel,
  submitText,
  className 
}) => {
  const { t } = useTranslation('product');
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialReviewText);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSubmit({
      rating,
      review_text: reviewText.trim() || undefined
    });
  };

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleStarMouseEnter = (starIndex) => {
    setHoveredStar(starIndex);
  };

  const handleStarMouseLeave = () => {
    setHoveredStar(0);
  };

  const isSubmitDisabled = rating === 0 || loading;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Rating Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('reviews.rating', 'Rating')} *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <button
              key={starIndex}
              type="button"
              className="p-1 rounded-sm hover:bg-muted transition-colors"
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarMouseEnter(starIndex)}
              onMouseLeave={handleStarMouseLeave}
              disabled={loading}
              data-testid={`review-star-${starIndex}`}
            >
              <Star 
                className={cn(
                  'w-6 h-6 transition-colors',
                  (hoveredStar ? starIndex <= hoveredStar : starIndex <= rating)
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('reviews.reviewText', 'Review')}
        </label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={t('reviews.reviewPlaceholder', 'Share your experience with this product...')}
          maxLength={2000}
          rows={4}
          disabled={loading}
          data-testid="review-text-input"
        />
        <div className="text-xs text-muted-foreground text-end">
          {reviewText.length}/2000
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          data-testid="review-form-submit-button"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
              {submitText || t('reviews.submit', 'Submit Review')}
            </div>
          ) : (
            submitText || t('reviews.submit', 'Submit Review')
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            data-testid="review-form-cancel-button"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
