"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  value: number
  readonly?: boolean
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
}

export function StarRating({ value, readonly = false, onChange, size = "md" }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <div className="flex items-center">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? "" : "cursor-pointer"} text-yellow-400`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= value ? "fill-current" : "fill-none"
            }`}
          />
        </button>
      ))}
    </div>
  )
}