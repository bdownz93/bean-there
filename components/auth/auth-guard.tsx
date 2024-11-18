"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { user, isInitialized } = useAuth()

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // If auth is required and user is not logged in, show message
  if (requireAuth && !user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please log in to access this content
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
