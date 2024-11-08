"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface UserReviewsProps {
  userId: string
}

export function UserReviews({ userId }: UserReviewsProps) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          beans (
            id,
            name,
            roaster:roasters (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <Link key={review.id} href={`/beans/${review.beans?.id}`}>
                <div className="flex gap-4 p-4 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{review.beans?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {review.beans?.roaster?.name}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{review.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    {review.brew_method && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Brew Method:</span> {review.brew_method}
                      </div>
                    )}
                    {review.flavor_notes && review.flavor_notes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {review.flavor_notes.map((note) => (
                          <span
                            key={note}
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}