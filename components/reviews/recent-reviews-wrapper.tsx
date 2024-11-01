"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { roasters } from "@/lib/data"
import { RecentReviews } from "./recent-reviews"
import type { Review } from "@/lib/types"

export function RecentReviewsWrapper() {
  const [reviews, setReviews] = useState<Review[]>([])
  const storeReviews = useStore((state) => state.reviews)

  useEffect(() => {
    if (!Array.isArray(storeReviews)) {
      setReviews([])
      return
    }

    const allReviews = storeReviews
      .map(review => {
        const roaster = roasters.find(r => 
          r.beans.some(b => b.id === review.beanId)
        )
        const bean = roaster?.beans.find(b => b.id === review.beanId)
        
        return {
          ...review,
          bean: bean?.name || "",
          roaster: roaster?.name || ""
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4)

    setReviews(allReviews)
  }, [storeReviews])

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