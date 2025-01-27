"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/components/auth/auth-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Session } from "@supabase/auth-helpers-nextjs"
import { useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <pre className="text-sm text-muted-foreground mb-4">{error.message}</pre>
        <button
          onClick={resetErrorBoundary}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark']}
        >
          <AuthProvider initialSession={initialSession}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
