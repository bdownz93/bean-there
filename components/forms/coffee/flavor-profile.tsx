"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROAST_LEVELS = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"]
const FLAVOR_NOTES = [
  "Chocolate", "Caramel", "Nuts", "Fruity", "Citrus", "Berry", 
  "Floral", "Spicy", "Earthy", "Honey", "Vanilla", "Wine"
]

interface FlavorProfileProps {
  selectedFlavors: string[]
  toggleFlavor: (flavor: string) => void
  isDecaf: boolean
}

export function FlavorProfile({
  selectedFlavors,
  toggleFlavor,
  isDecaf
}: FlavorProfileProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Roast Level</Label>
        <Select name="roastLevel" required>
          <SelectTrigger>
            <SelectValue placeholder="Select roast level" />
          </SelectTrigger>
          <SelectContent>
            {ROAST_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Aroma Intensity</Label>
          <Slider
            name="aromaIntensity"
            defaultValue={[50]}
            max={100}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <Slider
            name="bodyIntensity"
            defaultValue={[50]}
            max={100}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label>Acidity</Label>
          <Slider
            name="acidityIntensity"
            defaultValue={[50]}
            max={100}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label>Sweetness</Label>
          <Slider
            name="sweetnessIntensity"
            defaultValue={[50]}
            max={100}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label>Aftertaste</Label>
          <Slider
            name="aftertasteIntensity"
            defaultValue={[50]}
            max={100}
            step={1}
          />
        </div>
      </div>

      {!isDecaf && (
        <div className="space-y-2">
          <Label>Caffeine Content</Label>
          <Select name="caffeineContent">
            <SelectTrigger>
              <SelectValue placeholder="Select caffeine level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}