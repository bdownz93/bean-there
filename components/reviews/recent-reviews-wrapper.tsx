"use client"

import { useEffect, useState } from "react"
import { RecentReviews } from "./recent-reviews"
import type { Review } from "@/lib/types"

interface RecentReviewsWrapperProps {
  initialReviews: Review[]
}

export function RecentReviewsWrapper({ initialReviews }: RecentReviewsWrapperProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Recent Reviews</h2>
          <p className="text-muted-foreground">
            Latest thoughts from our community
          </p>
        </div>
      </div>
      <RecentReviews reviews={reviews} />
    </section>
  )
}