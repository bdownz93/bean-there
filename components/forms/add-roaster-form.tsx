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
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  social_media: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional()
  }).optional()
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const userId = user.id

      let logoUrl = null
      if (logo) {
        logoUrl = await uploadRoasterLogo(logo)
      }

      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

      const { data: roaster, error } = await supabase
        .from("roasters")
        .insert([
          {
            name: data.name,
            slug,
            description: data.description,
            website_url: data.website_url || null,
            phone: data.phone || null,
            email: data.email || null,
            instagram: data.instagram || null,
            social_media: data.social_media || {},
            location: selectedLocation.name,
            coordinates: {
              lat: selectedLocation.lat,
              lng: selectedLocation.lng
            },
            specialties: selectedSpecialties,
            created_by: userId,
            logo_url: logoUrl
          }
        ])
        .select()
        .single()

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["roasters"] })

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
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-6">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative h-20 w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setLogo(null)
                      setLogoPreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setLogo(file)
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setLogoPreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              id="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
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
            <Label>Location</Label>
            <LocationSearch onSelect={setSelectedLocation} />
          </div>

          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input
              id="website_url"
              type="url"
              {...register("website_url")}
            />
            {errors.website_url && (
              <p className="text-sm text-destructive">{errors.website_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input
              id="instagram"
              {...register("instagram")}
            />
            {errors.instagram && (
              <p className="text-sm text-destructive">{errors.instagram.message}</p>
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

          <div className="space-y-2">
            <Label>Social Media</Label>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  {...register("social_media.facebook")}
                />
                {errors.social_media?.facebook && (
                  <p className="text-sm text-destructive">{errors.social_media.facebook.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  {...register("social_media.twitter")}
                />
                {errors.social_media?.twitter && (
                  <p className="text-sm text-destructive">{errors.social_media.twitter.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  {...register("social_media.youtube")}
                />
                {errors.social_media?.youtube && (
                  <p className="text-sm text-destructive">{errors.social_media.youtube.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...register("social_media.linkedin")}
                />
                {errors.social_media?.linkedin && (
                  <p className="text-sm text-destructive">{errors.social_media.linkedin.message}</p>
                )}
              </div>
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