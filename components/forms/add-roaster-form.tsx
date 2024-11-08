"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import type { Roaster } from "@/lib/types"

interface Location {
  name: string
  lat: number
  lng: number
  placeId: string
}

interface AddRoasterFormProps {
  onRoasterAdded: (roaster: Roaster) => void
}

export function AddRoasterForm({ onRoasterAdded }: AddRoasterFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a roaster",
        variant: "destructive"
      })
      return
    }

    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string
      const slug = name.toLowerCase().replace(/\s+/g, "-")
      
      const roasterData = {
        name,
        slug,
        created_by: user.id,
        location: selectedLocation.name,
        description: formData.get("description") as string,
        rating: 0,
        specialties: (formData.get("specialties") as string).split(",").map(s => s.trim()),
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        },
        logo_url: "https://images.unsplash.com/photo-1559122143-f4e9bf761285?w=800&auto=format&fit=crop&q=60"
      }

      const { data, error } = await supabase
        .from('roasters')
        .insert([roasterData])
        .select(`
          *,
          created_by (
            id,
            name,
            username
          )
        `)
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('A roaster with this name already exists')
        }
        throw error
      }

      const newRoaster: Roaster = {
        ...data,
        beans: []
      }

      onRoasterAdded(newRoaster)
      setOpen(false)
      toast({
        title: "Success",
        description: "Roaster added successfully"
      })
      router.refresh()
    } catch (error) {
      console.error('Error adding roaster:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add roaster. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Roaster"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}