"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Star, X } from "lucide-react"
import { FlavorNotes } from "./flavor-notes"

const BREW_METHODS = [
  "Pour Over", "Espresso", "French Press", "AeroPress", 
  "Drip", "Cold Brew", "Moka Pot", "Chemex"
]

const GRIND_SIZES = [
  "Extra Fine", "Fine", "Medium-Fine", "Medium", 
  "Medium-Coarse", "Coarse"
]

const FLAVOR_NOTES = [
  // Fruity
  "Apple", "Berries", "Blackberry", "Blueberry", "Cherry", "Citrus", "Grape", 
  "Lemon", "Orange", "Peach", "Pear", "Plum", "Raspberry", "Strawberry",
  
  // Sweet
  "Brown Sugar", "Caramel", "Chocolate", "Cocoa", "Honey", "Maple", "Molasses", 
  "Toffee", "Vanilla",
  
  // Nutty/Roasted
  "Almond", "Hazelnut", "Peanut", "Pecan", "Roasted", "Toasted", "Walnut",
  
  // Spicy
  "Cinnamon", "Clove", "Nutmeg", "Pepper", "Spices",
  
  // Floral/Herbal
  "Floral", "Jasmine", "Lavender", "Rose", "Tea-like", "Herbal",
  
  // Other
  "Balanced", "Clean", "Complex", "Crisp", "Earthy", "Smooth", "Wine-like", 
  "Winey", "Woody"
]

interface ReviewFormProps {
  onSubmit: (data: {
    rating: number
    content: string
    brewMethod: string
    grindSize: string
    selectedFlavors: string[]
    photo: File | null
    aroma: number
    body: number
    acidity: number
    sweetness: number
    aftertaste: number
  }) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ReviewForm({ onSubmit, onCancel, isSubmitting }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [brewMethod, setBrewMethod] = useState("")
  const [grindSize, setGrindSize] = useState("")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  
  const [aroma, setAroma] = useState(50)
  const [body, setBody] = useState(50)
  const [acidity, setAcidity] = useState(50)
  const [sweetness, setSweetness] = useState(50)
  const [aftertaste, setAftertaste] = useState(50)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return
    }

    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const toggleFlavorNote = (flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      rating,
      content,
      brewMethod,
      grindSize,
      selectedFlavors,
      photo,
      aroma,
      body,
      acidity,
      sweetness,
      aftertaste
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Overall Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="text-yellow-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-8 w-8 ${
                    value <= rating ? "fill-current" : "fill-none"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Aroma</Label>
            <Slider value={[aroma]} onValueChange={([v]) => setAroma(v)} max={100} step={1} />
          </div>
          <div>
            <Label>Body</Label>
            <Slider value={[body]} onValueChange={([v]) => setBody(v)} max={100} step={1} />
          </div>
          <div>
            <Label>Acidity</Label>
            <Slider value={[acidity]} onValueChange={([v]) => setAcidity(v)} max={100} step={1} />
          </div>
          <div>
            <Label>Sweetness</Label>
            <Slider value={[sweetness]} onValueChange={([v]) => setSweetness(v)} max={100} step={1} />
          </div>
          <div>
            <Label>Aftertaste</Label>
            <Slider value={[aftertaste]} onValueChange={([v]) => setAftertaste(v)} max={100} step={1} />
          </div>
        </div>

        <div>
          <Label>Your Review</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts about this coffee..."
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Brew Method</Label>
            <Select value={brewMethod} onValueChange={setBrewMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {BREW_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Grind Size</Label>
            <Select value={grindSize} onValueChange={setGrindSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {GRIND_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Flavor Notes</Label>
          <div className="mt-2">
            <FlavorNotes
              notes={FLAVOR_NOTES}
              selectedNotes={selectedFlavors}
              onToggle={toggleFlavorNote}
              limit={12}
            />
          </div>
        </div>

        <div>
          <Label>Add Photo</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </div>
          {photoPreview && (
            <div className="mt-4 relative">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPhoto(null)
                  setPhotoPreview("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={photoPreview}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex-1"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        <Button 
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}