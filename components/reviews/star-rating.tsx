"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  readonly?: boolean
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
}

export function StarRating({ 
  value, 
  readonly = false, 
  onChange, 
  size = "md" 
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "text-yellow-400",
            !readonly && "hover:scale-110 transition-transform",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= value ? "fill-current" : "fill-none"
            )}
          />
        </button>
      ))}
    </div>
  )
}