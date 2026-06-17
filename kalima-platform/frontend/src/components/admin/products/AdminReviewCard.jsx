import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import RatingDisplay from '@/components/ui/RatingDisplay';
import { cn } from '@/lib/utils';

/**
 * AdminReviewCard component - Displays a single review with delete action
 * 
 * @param {Object} props
 * @param {Object} props.review - Review object
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const AdminReviewCard = ({ review, onDelete, loading, className }) => {
  const { t } = useTranslation('admin');

  if (!review) return null;

  const { id, rating, comment, content, user, created_at, createdAt } = review;

  // Support both property names for safety
  const reviewText = comment || content || '';
  const reviewDate = created_at || createdAt;

  const formattedDate = reviewDate ? new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(reviewDate)) : '';

  // Get user details securely
  const userName = user?.name || user?.full_name || t('products.reviews.anonymous', 'Anonymous');
  const userInitials = userName.substring(0, 2).toUpperCase();
  const avatarUrl = user?.avatar || user?.profile_image;

  return (
    <Card className={cn("overflow-hidden border-border", className)} data-testid={`admin-review-card-${id}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* User Info & Avatar */}
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className="bg-muted text-muted-foreground">{userInitials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <h4 className="font-semibold text-sm text-foreground">{userName}</h4>
                {formattedDate && (
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                )}
              </div>

              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <RatingDisplay rating={rating || 0} size="sm" showCount={false} />
              </div>

              {reviewText && (
                <p className="text-sm text-foreground mt-2">{reviewText}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center sm:items-start justify-end mt-4 sm:mt-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => onDelete(review)}
              disabled={loading}
              title={t('common.delete', 'Delete')}
              data-testid={`delete-review-${id}`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{t('common.delete', 'Delete')}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminReviewCard;
