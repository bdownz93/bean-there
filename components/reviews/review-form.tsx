"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface ReviewFormProps {
  onSubmit: (data: { rating: number; content: string }) => Promise<void>
  isLoading?: boolean
}

export function ReviewForm({ onSubmit, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0 || !content.trim()) return
    
    await onSubmit({
      rating,
      content: content.trim()
    })

    // Reset form
    setRating(0)
    setContent("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-yellow-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= (hoveredRating || rating) ? "fill-current" : "fill-none"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Review</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts about this coffee..."
            className="min-h-[100px] resize-none"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || rating === 0 || !content.trim()}
        >
          {isLoading ? "Submitting..." : "Submit Review"}
        </Button>
      </Card>
    </form>
  )
}