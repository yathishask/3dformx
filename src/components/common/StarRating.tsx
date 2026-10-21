import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md';
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, reviewsCount, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={iconSize}
            className={
              star <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-600'
            }
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-300">
        {rating.toFixed(1)}
      </span>
      {reviewsCount !== undefined && (
        <span className="text-xs text-slate-500">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
