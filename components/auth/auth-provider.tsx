"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

interface AuthProviderProps {
  children: React.ReactNode
  initialSession: Session | null
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (initialSession?.user) {
      setUser(initialSession.user)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Auth Provider:', {
        hasInitialSession: !!initialSession,
        hasUser: !!user,
        userId: user?.id,
        initialUserId: initialSession?.user?.id
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth State Change:', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id
        })
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        
        try {
          if (session?.user) {
            // Ensure user profile exists
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single()

            if (!existingProfile) {
              // Create profile if it doesn't exist
              await supabase.from('users').insert([
                {
                  id: session.user.id,
                  username: session.user.email?.split('@')[0],
                  name: session.user.user_metadata.name || session.user.email?.split('@')[0],
                  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])

              // Create initial user stats
              await supabase.from('user_stats').insert([
                {
                  user_id: session.user.id,
                  beans_tried: 0,
                  roasters_visited: 0,
                  total_reviews: 0,
                  unique_origins: 0,
                  roasters_created: 0,
                  experience_points: 0,
                  level: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])
            }
          }
          router.refresh()
        } catch (error) {
          console.error("Error creating user profile:", error)
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.refresh()
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, initialSession])

  const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      if (process.env.NODE_ENV === 'development') {
        // For local development, auto-confirm email
        toast({
          title: "Account created",
          description: "You can now sign in with your email and password."
        })
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a verification link to complete your registration."
        })
      }
    } catch (error) {
      console.error('Error signing up:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign up",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.session) {
        setUser(data.session.user)
        router.refresh()
        router.push('/')
      }
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGithub = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with GitHub",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign out",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithGithub,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}