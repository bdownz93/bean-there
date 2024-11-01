"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { StarRating } from "@/components/reviews/star-rating"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Review } from "@/lib/types"

const BREW_METHODS = [
  "Espresso",
  "Pour Over",
  "French Press",
  "Aeropress",
  "Cold Brew",
  "Drip",
]

const FLAVOR_NOTES = [
  "Fruity",
  "Nutty",
  "Chocolatey",
  "Floral",
  "Spicy",
  "Earthy",
  "Caramel",
  "Citrus",
  "Berry",
  "Vanilla",
  "Honey",
  "Smoky",
]

interface ReviewFormProps {
  onSubmit: (review: any) => void
  onCancel?: () => void
  initialData?: Review | null
}

export function ReviewForm({ onSubmit, onCancel, initialData }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [brewMethod, setBrewMethod] = useState("")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [sliders, setSliders] = useState({
    aroma: 50,
    body: 50,
    acidity: 50,
    sweetness: 50,
    aftertaste: 50,
    caffeine: 50,
  })
  const [content, setContent] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating)
      setBrewMethod(initialData.brewMethod || "")
      setSelectedFlavors(initialData.flavorNotes || [])
      setSliders(initialData.metrics || {
        aroma: 50,
        body: 50,
        acidity: 50,
        sweetness: 50,
        aftertaste: 50,
        caffeine: 50,
      })
      setContent(initialData.content)
      setPhotoPreview(initialData.photo || "")
    }
  }, [initialData])

  const handleFlavorToggle = (flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    )
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const review = {
      rating,
      brewMethod,
      flavorNotes: selectedFlavors,
      metrics: sliders,
      content,
      photo: photoPreview,
    }
    onSubmit(review)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label>Overall Rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="space-y-4">
        <Label>Brew Method</Label>
        <Select value={brewMethod} onValueChange={setBrewMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select brew method" />
          </SelectTrigger>
          <SelectContent>
            {BREW_METHODS.map(method => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Flavor Notes</Label>
        <div className="flex flex-wrap gap-2">
          {FLAVOR_NOTES.map(flavor => (
            <Badge
              key={flavor}
              variant={selectedFlavors.includes(flavor) ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:bg-primary/90",
                selectedFlavors.includes(flavor) && "bg-primary"
              )}
              onClick={() => handleFlavorToggle(flavor)}
            >
              {flavor}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {Object.entries(sliders).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <Label className="capitalize">{key}</Label>
            <Slider
              value={[value]}
              min={0}
              max={100}
              step={1}
              onValueChange={([newValue]) =>
                setSliders(prev => ({ ...prev, [key]: newValue }))
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Your Review</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this coffee..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Add Photo</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        {photoPreview && (
          <Card className="p-2">
            <div className="relative w-full h-48">
              <Image
                src={photoPreview}
                alt="Review photo preview"
                fill
                className="object-cover rounded-md"
              />
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1">
          {initialData ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  )
}