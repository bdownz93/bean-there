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
import { Store, ImageIcon, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase, uploadRoasterLogo } from "@/lib/supabase"
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
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal(""))
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RoasterFormValues>({
    resolver: zodResolver(roasterSchema)
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
  }

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

    setIsSubmitting(true)

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error("User not found")

      let logoUrl = null
      if (logo) {
        try {
          logoUrl = await uploadRoasterLogo(logo, userId)
        } catch (error) {
          console.error('Error uploading logo:', error)
          throw new Error('Failed to upload logo')
        }
      }

      // Create a URL-friendly slug from the name
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data: roaster, error } = await supabase
        .from('roasters')
        .insert([
          {
            name: data.name,
            slug,
            description: data.description,
            website_url: data.website_url || null,
            phone: data.phone || null,
            location: selectedLocation.name,
            coordinates: {
              lat: selectedLocation.lat,
              lng: selectedLocation.lng
            },
            specialties: selectedSpecialties,
            created_by: userId,
            logo_url: logoUrl,
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
      setLogo(null)
      setLogoPreview(null)
      setOpen(false)

      router.push(`/roasters/${roaster.slug}`)
    } catch (error) {
      console.error('Error adding roaster:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add roaster",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Roaster</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            {logoPreview ? (
              <div className="relative mt-2 w-32 h-32 rounded-lg overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Upload Logo</span>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <LocationSearch
              onSelect={(location) => setSelectedLocation(location)}
              selectedLocation={selectedLocation}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="h-32"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              {...register("website_url")}
            />
            {errors.website_url && (
              <p className="text-sm text-destructive">{errors.website_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Roaster"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}