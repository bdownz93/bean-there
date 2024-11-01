"use client"

import { useStore } from "@/lib/store"

export function ReviewCount() {
  const reviews = useStore((state) => state.reviews)
  return (
    <div className="text-2xl font-bold">
      {Array.isArray(reviews) ? reviews.length : 0}
    </div>
  )
}