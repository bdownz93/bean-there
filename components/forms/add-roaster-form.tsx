"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LocationSearch } from "@/components/location/location-search"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Coffee } from "lucide-react"

interface Location {
  name: string
  lat: number
  lng: number
}

export function AddRoasterForm() {
  const router = useRouter()
  const addRoaster = useStore((state) => state.addRoaster)
  const [open, setOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    if (!selectedLocation) {
      alert("Please select a location")
      return
    }

    const roaster = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
      location: selectedLocation.name,
      description: formData.get("description") as string,
      rating: 0,
      specialties: (formData.get("specialties") as string).split(",").map(s => s.trim()),
      coordinates: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      },
      beans: [],
      logo: "https://images.unsplash.com/photo-1559122143-f4e9bf761285?w=800&auto=format&fit=crop&q=60"
    }

    addRoaster(roaster)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Coffee className="mr-2 h-4 w-4" />
          Add Roaster
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Roaster</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <LocationSearch 
              onLocationSelect={(location) => setSelectedLocation(location)} 
            />
            {selectedLocation && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedLocation.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input 
              id="specialties" 
              name="specialties" 
              placeholder="Single Origin, Espresso, Cold Brew" 
              required 
            />
          </div>
          <Button type="submit" className="w-full">Add Roaster</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}