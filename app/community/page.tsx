"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/user/activity-feed"
import { PopularUsers } from "@/components/user/popular-users"
import { TrendingBeans } from "@/components/bean/trending-beans"

export default function CommunityPage() {
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
              <ActivityFeed />
            </TabsContent>
            <TabsContent value="trending">
              <TrendingBeans />
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