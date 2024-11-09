"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/auth-helpers-nextjs"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

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
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_IN') {
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
          router.push('/')
        } catch (error) {
          console.error("Error creating user profile:", error)
        }
      }
      
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
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

      if (data.user) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account.",
          duration: 5000
        })
        router.push('/login?message=Please check your email to verify your account')
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      })
      throw error
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
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive"
      })
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive"
      })
      throw error
    }
  }

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with GitHub",
        variant: "destructive"
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      })
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}