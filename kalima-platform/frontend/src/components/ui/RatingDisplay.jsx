import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * RatingDisplay component - Shows star rating with review count
 * 
 * @param {Object} props
 * @param {number} props.rating - Average rating (0-5)
 * @param {number} props.reviewCount - Number of reviews
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.showCount - Whether to show review count
 * @param {string} props.className - Additional CSS classes
 */
const RatingDisplay = ({ 
  rating = 0, 
  reviewCount = 0, 
  size = 'md', 
  showCount = true, 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const containerSizeClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  const { t, i18n } = useTranslation("product");
  // Generate star display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`full-${i}`} 
          className={cn('fill-primary text-primary', sizeClasses[size])}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <StarHalf 
          key="half" 
          className={cn('fill-primary text-primary', sizeClasses[size])}
        />
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className={cn('text-muted-foreground', sizeClasses[size])}
        />
      );
    }

    return stars;
  };

  if (rating === 0 && reviewCount === 0) {
    return (
      <div className={cn('flex items-center', containerSizeClasses[size], className)}>
        <span className={cn('text-muted-foreground', textSizes[size])}>
          {t('reviews.noReviews')}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', containerSizeClasses[size], className)}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showCount && (
        <span className={cn('text-muted-foreground ms-1', textSizes[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
