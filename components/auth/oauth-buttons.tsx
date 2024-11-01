"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "./auth-provider"

export function OAuthButtons() {
  const { signInWithGoogle, signInWithGithub } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGithub()
      }
    } catch (err) {
      let errorMessage = `Error signing in with ${provider}. Please try again.`
      
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else {
          errorMessage = err.message
        }
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <Button 
        variant="outline" 
        onClick={() => handleOAuthSignIn('github')}
        disabled={isLoading}
      >
        <Icons.gitHub className="mr-2 h-4 w-4" />
        Github
      </Button>
      <Button 
        variant="outline" 
        onClick={() => handleOAuthSignIn('google')}
        disabled={isLoading}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  )
}