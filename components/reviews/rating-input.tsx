'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingInputProps {
  value?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingInput({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const starSize = sizes[size];

  return (
    <div 
      className={cn(
        'flex items-center gap-1',
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={cn(
            'transition-colors',
            !readOnly && 'hover:scale-110',
            readOnly && 'cursor-default'
          )}
          onMouseEnter={() => !readOnly && setHoverRating(rating)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          onClick={() => !readOnly && onChange?.(rating)}
          disabled={readOnly}
        >
          <Star
            className={cn(
              starSize,
              'transition-colors',
              (rating <= (hoverRating || value)) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-muted text-muted'
            )}
          />
        </button>
      ))}
    </div>
  );
}
