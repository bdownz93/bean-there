"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Coffee, Store } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { LocationSearch } from "@/components/location/location-search"

const SPECIALTIES = [
  "Single Origin", "Espresso Blends", "Light Roasts", "Dark Roasts",
  "Direct Trade", "Organic", "Fair Trade", "Specialty Coffee",
  "Cold Brew", "Pour Over", "Traditional", "Experimental"
]

const roasterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
})

type RoasterFormValues = z.infer<typeof roasterSchema>

interface Location {
  name: string
  lat: number
  lng: number
}

export function AddRoasterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RoasterFormValues>({
    resolver: zodResolver(roasterSchema)
  })

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const onSubmit = async (data: RoasterFormValues) => {
    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: roaster, error } = await supabase
        .from('roasters')
        .insert([
          {
            ...data,
            location: selectedLocation.name,
            coordinates: {
              lat: selectedLocation.lat,
              lng: selectedLocation.lng
            },
            specialties: selectedSpecialties,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            logo_url: "https://images.unsplash.com/photo-1559122143-f4e9bf761285?w=800&auto=format&fit=crop&q=60",
            rating: 0
          }
        ])
        .select()
        .single()

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['roasters'] })
      
      toast({
        title: "Success",
        description: "Roaster added successfully"
      })

      reset()
      setSelectedLocation(null)
      setSelectedSpecialties([])
      setOpen(false)

      router.push(`/roasters/${roaster.slug}`)
    } catch (error) {
      console.error('Error adding roaster:', error)
      toast({
        title: "Error",
        description: "Failed to add roaster. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Store className="mr-2 h-4 w-4" />
          Add Roaster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Roaster</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <LocationSearch onLocationSelect={setSelectedLocation} />
            {selectedLocation && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedLocation.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <Badge
                  key={specialty}
                  variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSpecialty(specialty)}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input {...register("website")} placeholder="https://" />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="+1 (555) 555-5555" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...register("email")} type="email" />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit">Add Roaster</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}