"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginForm } from "@/components/auth/login-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import Link from "next/link"

export default function LoginPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const message = searchParams.get("message")
  const reason = searchParams.get("reason")
  const redirect = searchParams.get("redirect")

  useEffect(() => {
    console.log('🔑 Login page state:', {
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      redirect
    })

    if (!isLoading && user) {
      if (redirect) {
        console.log('📍 Redirecting to:', redirect)
        router.push(redirect)
      } else {
        router.push('/')
      }
    }
  }, [user, isLoading, redirect, router])

  useEffect(() => {
    if (message) {
      toast({
        title: "Notice",
        description: message
      })
    }

    if (reason) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue",
        variant: "destructive"
      })
    }
  }, [message, reason, toast])

  if (isLoading || user) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <OAuthButtons />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <LoginForm />
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}