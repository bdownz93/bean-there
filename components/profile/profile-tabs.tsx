"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileOverview } from "./profile-overview"
import { ProfileReviews } from "./profile-reviews"
import { ProfileSettings } from "./profile-settings"

interface ProfileTabsProps {
  userId: string
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ProfileOverview userId={userId} />
      </TabsContent>

      <TabsContent value="reviews">
        <ProfileReviews userId={userId} />
      </TabsContent>

      <TabsContent value="settings">
        <ProfileSettings userId={userId} />
      </TabsContent>
    </Tabs>
  )
}