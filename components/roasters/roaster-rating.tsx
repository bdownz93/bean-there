import { Star } from "lucide-react"

interface RoasterRatingProps {
  rating: number
}

export function RoasterRating({ rating }: RoasterRatingProps) {
  return (
    <div className="flex items-center">
      <Star className="h-4 w-4 fill-current text-yellow-400" />
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}