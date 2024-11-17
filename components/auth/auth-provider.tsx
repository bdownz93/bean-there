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
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth State Change:', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id
        })
      }

      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.refresh()
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
        router.refresh()
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

      if (error) {
        console.error('Error signing in:', error)
        return { error }
      }

      if (data.session) {
        setUser(data.session.user)
        router.refresh()
        return { data }
      }
    } catch (error) {
      console.error('Error signing in:', error)
      return { error }
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
      
      // Force clear the user state
      setUser(null)
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error signing out",
        description: "Please try again",
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