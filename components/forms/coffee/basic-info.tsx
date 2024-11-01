"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Roaster } from "@/lib/types"

const CERTIFICATIONS = ["Organic", "Fair Trade", "Rainforest Alliance", "Bird Friendly", "Direct Trade"]
const BAG_SIZES = ["250g", "500g", "1kg"]

interface BasicInfoProps {
  roasters: Roaster[]
  selectedRoaster: string
  setSelectedRoaster: (value: string) => void
  selectedCertifications: string[]
  toggleCertification: (cert: string) => void
  isLimitedEdition: boolean
  setIsLimitedEdition: (value: boolean) => void
  isDecaf: boolean
  setIsDecaf: (value: boolean) => void
}

export function BasicInfo({
  roasters,
  selectedRoaster,
  setSelectedRoaster,
  selectedCertifications,
  toggleCertification,
  isLimitedEdition,
  setIsLimitedEdition,
  isDecaf,
  setIsDecaf
}: BasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Coffee Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label>Roaster</Label>
          <Select value={selectedRoaster} onValueChange={setSelectedRoaster} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a roaster" />
            </SelectTrigger>
            <SelectContent>
              {roasters.map((roaster) => (
                <SelectItem key={roaster.id} value={roaster.id}>
                  {roaster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Coffee Type</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-origin">Single Origin</SelectItem>
              <SelectItem value="blend">Blend</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="roastDate">Roast Date</Label>
          <Input type="date" id="roastDate" name="roastDate" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Certifications</Label>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATIONS.map((cert) => (
            <Badge
              key={cert}
              variant={selectedCertifications.includes(cert) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleCertification(cert)}
            >
              {cert}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input type="number" step="0.01" id="price" name="price" required />
        </div>
        <div className="space-y-2">
          <Label>Bag Sizes</Label>
          <Select name="bagSizes" required>
            <SelectTrigger>
              <SelectValue placeholder="Select sizes" />
            </SelectTrigger>
            <SelectContent>
              {BAG_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="limited"
            checked={isLimitedEdition}
            onCheckedChange={setIsLimitedEdition}
          />
          <Label htmlFor="limited">Limited Edition</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="decaf"
            checked={isDecaf}
            onCheckedChange={setIsDecaf}
          />
          <Label htmlFor="decaf">Decaf</Label>
        </div>
      </div>
    </div>
  )
}