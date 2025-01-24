"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "./auth-provider"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      console.log('Attempting login:', { email })

      const result = await signIn(email, password)
      
      console.log('Login result:', {
        success: !result?.error,
        error: result?.error?.message,
        hasData: !!result?.data
      })

      if (result?.error) {
        setError(result.error.message)
        toast({
          title: "Error",
          description: result.error.message || "Invalid email or password",
          variant: "destructive"
        })
        return
      }

      // Auth provider will handle redirect
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : "An error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground">
          <div>Redirect: {searchParams.get('redirect')}</div>
          <div>Reason: {searchParams.get('reason')}</div>
        </div>
      )}
      <Button disabled={isLoading}>
        {isLoading && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Sign In
      </Button>
    </form>
  )
}