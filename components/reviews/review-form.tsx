"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const BREW_METHODS = ["Espresso", "Pour Over", "French Press", "Drip", "Cold Brew", "AeroPress"]
const GRIND_SIZES = ["Extra Fine", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse"]
const FLAVOR_NOTES = [
  "Chocolate", "Caramel", "Nuts", "Fruity", "Citrus", "Berry", 
  "Floral", "Spicy", "Earthy", "Honey", "Vanilla", "Wine"
]

interface ReviewFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ReviewForm({ onSubmit, onCancel, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [brewMethod, setBrewMethod] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [detailedRatings, setDetailedRatings] = useState({
    aroma: 0,
    body: 0,
    acidity: 0,
    sweetness: 0,
    aftertaste: 0
  })
  const [brewDetails, setBrewDetails] = useState({
    grindSize: "",
    waterTemp: "",
    brewTime: "",
    doseGrams: "",
    yieldGrams: ""
  })

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    const formData = {
      rating,
      content: content.trim(),
      brewMethod,
      brewTime: brewDetails.brewTime || undefined,
      waterTemp: brewDetails.waterTemp || undefined,
      grindSize: brewDetails.grindSize || undefined,
      doseGrams: brewDetails.doseGrams ? parseFloat(brewDetails.doseGrams) : undefined,
      yieldGrams: brewDetails.yieldGrams ? parseFloat(brewDetails.yieldGrams) : undefined,
      flavorNotes: selectedFlavors.length > 0 ? selectedFlavors : undefined,
      photoUrl: photoUrl || undefined,
      aromaRating: detailedRatings.aroma || undefined,
      bodyRating: detailedRatings.body || undefined,
      acidityRating: detailedRatings.acidity || undefined,
      sweetnessRating: detailedRatings.sweetness || undefined,
      aftertasteRating: detailedRatings.aftertaste || undefined
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-yellow-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= (hoveredRating || rating) ? "fill-current" : "fill-none"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your Review</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this coffee..."
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Add More Details"}
          </Button>

          {showDetails && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Detailed Ratings</Label>
                {Object.entries(detailedRatings).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key}</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setDetailedRatings(prev => ({
                            ...prev,
                            [key]: star
                          }))}
                          className="text-yellow-400"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= value ? "fill-current" : "fill-none"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Label>Brew Details</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Brew Method</Label>
                    <Select value={brewMethod} onValueChange={setBrewMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
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
                  <div className="space-y-2">
                    <Label>Grind Size</Label>
                    <Select 
                      value={brewDetails.grindSize}
                      onValueChange={v => setBrewDetails(prev => ({ ...prev, grindSize: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRIND_SIZES.map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Water Temperature (°C)</Label>
                    <Input
                      type="number"
                      value={brewDetails.waterTemp}
                      onChange={e => setBrewDetails(prev => ({ ...prev, waterTemp: e.target.value }))}
                      placeholder="94"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brew Time</Label>
                    <Input
                      value={brewDetails.brewTime}
                      onChange={e => setBrewDetails(prev => ({ ...prev, brewTime: e.target.value }))}
                      placeholder="3:30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dose (g)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={brewDetails.doseGrams}
                      onChange={e => setBrewDetails(prev => ({ ...prev, doseGrams: e.target.value }))}
                      placeholder="18"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Yield (g)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={brewDetails.yieldGrams}
                      onChange={e => setBrewDetails(prev => ({ ...prev, yieldGrams: e.target.value }))}
                      placeholder="36"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Flavor Notes</Label>
                <div className="flex flex-wrap gap-2">
                  {FLAVOR_NOTES.map((flavor) => (
                    <Badge
                      key={flavor}
                      variant={selectedFlavors.includes(flavor) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFlavor(flavor)}
                    >
                      {flavor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Photo URL</Label>
                <Input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/coffee-photo.jpg"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || rating === 0 || !content.trim()}
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  )
}