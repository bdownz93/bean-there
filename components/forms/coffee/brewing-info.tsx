"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BREW_METHODS = ["Espresso", "Pour Over", "French Press", "Drip", "Cold Brew", "AeroPress"]
const GRIND_SIZES = ["Extra Fine", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse"]

interface BrewingInfoProps {
  selectedBrewMethods: string[]
  toggleBrewMethod: (method: string) => void
}

export function BrewingInfo({
  selectedBrewMethods,
  toggleBrewMethod
}: BrewingInfoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Recommended Brew Methods</Label>
        <div className="flex flex-wrap gap-2">
          {BREW_METHODS.map((method) => (
            <Badge
              key={method}
              variant={selectedBrewMethods.includes(method) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleBrewMethod(method)}
            >
              {method}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Recommended Grind Size</Label>
        <Select name="grindSize">
          <SelectTrigger>
            <SelectValue placeholder="Select grind size" />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="waterTemp">Water Temperature (°C)</Label>
          <Input
            type="number"
            id="waterTemp"
            name="waterTemp"
            placeholder="e.g., 95"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brewTime">Brew Time</Label>
          <Input
            id="brewTime"
            name="brewTime"
            placeholder="e.g., 3-4 minutes"
          />
        </div>
      </div>
    </div>
  )
}