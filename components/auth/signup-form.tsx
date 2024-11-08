"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface FormData {
  name: string
  username: string
  email: string
  password: string
}

const initialFormData: FormData = {
  name: "",
  username: "",
  email: "",
  password: ""
}

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})

  const validateForm = () => {
    const errors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required"
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      errors.username = "Username must be 3-20 characters and can only contain letters, numbers, and underscores"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      // First check if username exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single()

      if (existingUser) {
        setFormErrors(prev => ({
          ...prev,
          username: "This username is already taken"
        }))
        return
      }

      // If no existing user, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            username: formData.username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      if (data.user) {
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
          duration: 5000
        })
        router.push('/login?message=Please check your email to verify your account')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          disabled={isLoading}
          aria-describedby={formErrors.name ? "name-error" : undefined}
        />
        {formErrors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {formErrors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          disabled={isLoading}
          aria-describedby={formErrors.username ? "username-error" : undefined}
        />
        {formErrors.username && (
          <p id="username-error" className="text-sm text-destructive">
            {formErrors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          disabled={isLoading}
          aria-describedby={formErrors.email ? "email-error" : undefined}
        />
        {formErrors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {formErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          disabled={isLoading}
          aria-describedby={formErrors.password ? "password-error" : undefined}
        />
        {formErrors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {formErrors.password}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Create Account
      </Button>
    </form>
  )
}