"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isInitialized: false
  })
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const redirectInProgress = useRef(false)

  const handleRedirect = useCallback((user: User | null) => {
    if (redirectInProgress.current) {
      console.log('🚫 Redirect already in progress, skipping...')
      return
    }

    const protectedRoutes = ['/profile', '/beans/new', '/roasters/new']
    const authRoutes = ['/login', '/signup']
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route))
    const redirect = searchParams.get('redirect')

    console.log('🚦 Navigation state:', {
      pathname,
      isProtectedRoute,
      isAuthRoute,
      hasUser: !!user,
      userId: user?.id,
      redirect,
      isInitialized: state.isInitialized
    })

    if (!state.isInitialized) {
      console.log('⏳ Waiting for auth initialization...')
      return
    }

    try {
      redirectInProgress.current = true

      if (user) {
        if (isAuthRoute) {
          if (redirect) {
            console.log('📍 Auth route redirect:', redirect)
            router.push(redirect)
          } else {
            router.push('/')
          }
        }
      } else {
        if (isProtectedRoute) {
          const loginUrl = `/login?redirect=${pathname}`
          console.log('🔒 Protected route redirect:', loginUrl)
          router.push(loginUrl)
        }
      }
    } finally {
      // Reset redirect flag after a short delay
      setTimeout(() => {
        redirectInProgress.current = false
      }, 100)
    }
  }, [pathname, router, searchParams, state.isInitialized])

  const updateAuthState = useCallback((user: User | null, isLoading = false) => {
    setState(prev => {
      // Don't update if nothing changed
      if (
        prev.user?.id === user?.id && 
        prev.isLoading === isLoading && 
        prev.isInitialized
      ) {
        return prev
      }

      const newState = {
        user,
        isLoading,
        isInitialized: true
      }

      console.log('🔄 Auth state update:', {
        prevState: {
          hasUser: !!prev.user,
          userId: prev.user?.id,
          isLoading: prev.isLoading,
          isInitialized: prev.isInitialized
        },
        newState: {
          hasUser: !!user,
          userId: user?.id,
          isLoading,
          isInitialized: true
        }
      })

      return newState
    })
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Initial session:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          pathname
        })

        if (mounted) {
          updateAuthState(session?.user ?? null, false)
          // Only handle redirect on initial auth if we're on a protected route
          const protectedRoutes = ['/profile', '/beans/new', '/roasters/new']
          const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
          if (isProtectedRoute) {
            handleRedirect(session?.user ?? null)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          updateAuthState(null, false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        pathname
      })

      if (mounted) {
        updateAuthState(session?.user ?? null, false)
        // Only handle redirect on auth state change if it's a sign in/out event
        if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
          handleRedirect(session?.user ?? null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [pathname, updateAuthState, handleRedirect])

  const signIn = async (email: string, password: string) => {
    try {
      updateAuthState(null, true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('✅ Sign in successful:', {
        userId: data.user?.id,
        email: data.user?.email
      })

      updateAuthState(data.user, false)
      handleRedirect(data.user)
    } catch (error) {
      console.error('❌ Sign in error:', error)
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      updateAuthState(null, true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      updateAuthState(null, false)
      router.push('/login')
    } catch (error) {
      console.error('❌ Sign out error:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}