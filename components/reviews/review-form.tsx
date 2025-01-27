'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { RatingInput } from "./rating-input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
    rating: 0,
    review_text: "",
    brewing_method: "",
    aroma_notes: [] as string[],
    flavor_notes: [] as string[],
  })
  const [newAromaNote, setNewAromaNote] = useState("")
  const [newFlavorNote, setNewFlavorNote] = useState("")

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

    if (formData.rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('bean_ratings')
        .insert([{
          ...formData,
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
      router.refresh()
    } catch (error: any) {
      console.error('Error adding review:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to add review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addNote = (type: 'aroma' | 'flavor', note: string) => {
    if (!note.trim()) return
    
    const field = `${type}_notes` as const
    if (!formData[field].includes(note)) {
      handleChange(field, [...formData[field], note.trim()])
    }
    
    if (type === 'aroma') {
      setNewAromaNote("")
    } else {
      setNewFlavorNote("")
    }
  }

  const removeNote = (type: 'aroma' | 'flavor', note: string) => {
    const field = `${type}_notes` as const
    handleChange(field, formData[field].filter(n => n !== note))
  }

  const brewMethods = [
    "Pour Over",
    "French Press",
    "Espresso",
    "Drip",
    "AeroPress",
    "Cold Brew",
    "Moka Pot",
    "Chemex",
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
            <Label>Rating</Label>
            <RatingInput
              value={formData.rating}
              onChange={(value) => handleChange('rating', value)}
              size="lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brewing_method">Brew Method</Label>
            <Select
              value={formData.brewing_method}
              onValueChange={(value) => handleChange('brewing_method', value)}
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

          <div className="space-y-2">
            <Label>Aroma Notes</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.aroma_notes.map((note) => (
                <Badge key={note} variant="secondary" className="gap-1">
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote('aroma', note)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAromaNote}
                onChange={(e) => setNewAromaNote(e.target.value)}
                placeholder="Add aroma note (e.g., Floral, Nutty)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNote('aroma', newAromaNote)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addNote('aroma', newAromaNote)}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Flavor Notes</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.flavor_notes.map((note) => (
                <Badge key={note} variant="secondary" className="gap-1">
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote('flavor', note)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newFlavorNote}
                onChange={(e) => setNewFlavorNote(e.target.value)}
                placeholder="Add flavor note (e.g., Chocolate, Citrus)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNote('flavor', newFlavorNote)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addNote('flavor', newFlavorNote)}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_text">Review</Label>
            <Textarea
              id="review_text"
              value={formData.review_text}
              onChange={(e) => handleChange('review_text', e.target.value)}
              required
              placeholder="What did you think of this coffee? Consider aroma, taste, body, and overall experience."
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}