'use client'

import { Suspense } from "react"
import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileReviews } from "@/components/profile/profile-reviews"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"

export default function ProfilePage() {
  const { user, isLoading, isInitialized } = useAuth()

  console.log('👤 Profile page state:', {
    isLoading,
    isInitialized,
    hasUser: !!user,
    userId: user?.id,
    email: user?.email
  })

  // Only show loading state during initial load
  if (!isInitialized) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <div className="ml-2">Initializing...</div>
        </div>
      </div>
    )
  }

  // If we're initialized but don't have a user, let auth provider handle redirect
  if (!user) {
    return null
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <div className="ml-2">Loading profile...</div>
            </div>
          }>
            <ProfileForm user={user} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reviews">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <div className="ml-2">Loading reviews...</div>
            </div>
          }>
            <ProfileReviews userId={user.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}