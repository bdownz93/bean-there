"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/user/activity-feed"
import { PopularUsers } from "@/components/user/popular-users"
import { TrendingBeans } from "@/components/bean/trending-beans"
import { useQuery } from "@tanstack/react-query"
import { getAllBeans, getReviews } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

export default function CommunityPage() {
  const { data: reviews = [], isLoading: isReviewsLoading, isError: isReviewsError } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => getReviews(),
    retry: 1,
    staleTime: 1000 * 60 // 1 minute
  })

  const { data: beans = [], isLoading: isBeansLoading, isError: isBeansError } = useQuery({
    queryKey: ['beans'],
    queryFn: () => getAllBeans(),
    retry: 1,
    staleTime: 1000 * 60 // 1 minute
  })

  if (isReviewsLoading || isBeansLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-8 md:grid-cols-[1fr,300px]">
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isReviewsError || isBeansError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Unable to load community content. Please try again later.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-[1fr,300px]">
        <div className="space-y-8">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="activity" className="flex-1">Activity Feed</TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <ActivityFeed reviews={reviews} />
            </TabsContent>
            <TabsContent value="trending">
              <TrendingBeans beans={beans} reviews={reviews} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-8">
          <PopularUsers />
        </div>
      </div>
    </div>
  )
}