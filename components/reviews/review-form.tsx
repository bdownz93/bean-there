'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

interface ReviewFormProps {
  beanId: string
  onSuccess?: () => void
}

export function ReviewForm({ beanId, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    content: "",
    brew_method: "",
    flavor_notes: [] as string[],
    aroma: 5,
    body: 5,
    acidity: 5,
    sweetness: 5,
    aftertaste: 5,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Convert decimal rating to integer (1-5)
      const integerRating = Math.round(formData.rating)
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...formData,
          rating: integerRating,
          user_id: user.id,
          bean_id: beanId,
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Review added successfully!",
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error adding review:', error)
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const brewMethods = [
    "Pour Over",
    "French Press",
    "Espresso",
    "Aeropress",
    "Cold Brew",
    "Drip",
    "Other",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Review</CardTitle>
        <CardDescription>
          Share your thoughts on this coffee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <Slider
              value={[formData.rating]}
              onValueChange={([value]) => handleChange('rating', Math.round(value))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-center">
              {formData.rating} / 5
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Review</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              required
              placeholder="What did you think of this coffee?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brew_method">Brew Method</Label>
            <Select
              value={formData.brew_method}
              onValueChange={(value) => handleChange('brew_method', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="How did you brew it?" />
              </SelectTrigger>
              <SelectContent>
                {brewMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}