"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { getAuthErrorMessage } from "@/lib/auth-utils"

interface AuthContextType {
  user: User | null
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // Handle auth callback
        const params = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          router.push('/')
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_IN') {
        router.push('/')
      }
      
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleAuthError = (error: unknown) => {
    console.error("Auth error:", error)
    const message = getAuthErrorMessage(error)
    
    // If auth is not configured, show a more helpful message
    if (message.includes('Auth not configured')) {
      toast({
        title: "Auth Not Configured",
        description: "Please set up Supabase environment variables to enable authentication.",
        variant: "destructive",
        duration: 5000
      })
      return
    }
    
    toast({
      title: "Authentication Error",
      description: message,
      variant: "destructive",
      duration: 5000
    })
    
    throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}`
        }
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{
            id: data.user.id,
            name,
            email,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
            created_at: new Date().toISOString()
          }])

        if (profileError) throw profileError

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
          duration: 5000
        })

        router.push('/login')
      }
    } catch (error) {
      handleAuthError(error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      router.push("/")
    } catch (error) {
      handleAuthError(error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`
        }
      })
      
      if (error) throw error
    } catch (error) {
      handleAuthError(error)
    }
  }

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}`
        }
      })
      
      if (error) throw error
    } catch (error) {
      handleAuthError(error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/login")
    } catch (error) {
      handleAuthError(error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}