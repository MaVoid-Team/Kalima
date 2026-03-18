import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';
import { Star, Edit, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import RatingDisplay from '@/components/ui/RatingDisplay';

/**
 * ReviewCard component - Individual review display
 * 
 * @param {Object} props
 * @param {Object} props.review - Review data
 * @param {string} props.review.review_text - Review text
 * @param {number} props.review.rating - Rating
 * @param {Object} props.review.users - User information
 * @param {string} props.review.created_at - Creation date
 * @param {boolean} props.isOwnReview - Whether this is the user's own review
 * @param {boolean} props.canEdit - Whether user can edit this review
 * @param {Function} props.onEdit - Edit handler
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {string} props.className - Additional CSS classes
 */
const ReviewCard = ({
  review,
  isOwnReview = false,
  canEdit = false,
  onEdit,
  showActions = false,
  className
}) => {
  const { t, i18n } = useTranslation('product');
  const isRtl = i18n.dir() === 'rtl';

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: isRtl ? arSA : undefined });
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    onEdit?.(review);
  };

  return (
    <Card className={cn('space-y-4', className)} data-testid={`review-item-${review.id}`}>
      <CardContent className="pt-6">
        {/* Review Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* User Info */}
            <div>
              <div className="font-medium text-foreground">
                {review.users?.name || t('reviews.anonymousUser', 'Anonymous User')}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && canEdit && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                data-testid={`review-edit-button-${review.id}`}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="mt-3">
          <RatingDisplay
            rating={review.rating}
            showCount={false}
            size="sm"
          />
        </div>

        {/* Review Text */}
        {review.review_text && (
          <div className="mt-3 text-sm text-foreground leading-relaxed">
            {review.review_text}
          </div>
        )}

        {/* Own Review Badge */}
        {isOwnReview && (
          <div className="mt-3">
            <Badge variant="secondary" className="text-xs">
              {t('reviews.yourReview', 'Your Review')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
