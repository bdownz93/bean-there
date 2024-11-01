"use client"

import { useStore } from "@/lib/store"
import { notFound } from "next/navigation"
import { UserProfile } from "@/components/user/user-profile"
import { UserReviews } from "@/components/user/user-reviews"

interface UserProfileClientProps {
  username: string
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const users = useStore((state) => state.users || {})
  const user = Object.values(users).find(u => u?.username === username)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <UserProfile user={user} />
      <UserReviews userId={user.id} />
    </div>
  )
}