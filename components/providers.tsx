"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Session } from "@supabase/auth-helpers-nextjs"

interface ProvidersProps {
  children: React.ReactNode
  initialSession: Session | null
}

export function Providers({ children, initialSession }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={initialSession}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
