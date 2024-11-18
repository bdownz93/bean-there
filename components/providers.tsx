"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/components/auth/auth-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Session } from "@supabase/auth-helpers-nextjs"
import { useEffect } from "react"

const queryClient = new QueryClient()

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession: Session | null
}) {
  useEffect(() => {
    // Log initial session state
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Providers Initial Session:', {
        hasSession: !!initialSession,
        userId: initialSession?.user?.id,
        email: initialSession?.user?.email,
        accessToken: initialSession?.access_token ? 'exists' : 'missing',
        refreshToken: initialSession?.refresh_token ? 'exists' : 'missing',
        expiresAt: initialSession?.expires_at,
        currentTime: Math.floor(Date.now() / 1000)
      })
    }
  }, [initialSession])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider initialSession={initialSession}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
