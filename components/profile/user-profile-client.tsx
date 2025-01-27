"use client"

import { useStore } from "@/lib/store"
import { notFound } from "next/navigation"
import { UserProfile } from "@/components/profile/user-profile"
import { UserReviews } from "@/components/profile/user-reviews"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface UserProfileClientProps {
  username: string
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const users = useStore((state) => state.users || {})
  const user = Object.values(users).find(u => u?.username === username)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsOwnProfile(session.user.id === user?.id)
      }
    }
    checkCurrentUser()
  }, [user?.id])

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <UserProfile user={user} isOwnProfile={isOwnProfile} />
      <UserReviews userId={user.id} />
    </div>
  )
}