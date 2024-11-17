"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { useQueryClient } from "@tanstack/react-query"
import { supabase, uploadBeanPhoto } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Coffee, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import type { Roaster } from "@/lib/types"

interface AddBeanFormProps {
  roasters: Roaster[]
}

export function AddBeanForm({ roasters = [] }: AddBeanFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedRoaster, setSelectedRoaster] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a bean",
        variant: "destructive"
      })
      return
    }

    if (!selectedRoaster) {
      toast({
        title: "Error",
        description: "Please select a roaster",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      
      let imageUrl = null
      if (photo) {
        try {
          imageUrl = await uploadBeanPhoto(photo, user.id)
        } catch (error) {
          console.error('Error uploading photo:', error)
          throw new Error('Failed to upload photo')
        }
      }

      const beanData = {
        created_by: user.id,
        roaster_id: selectedRoaster,
        name,
        slug,
        origin: formData.get("origin") as string || null,
        process: formData.get("process") as string || null,
        roast_level: formData.get("roastLevel") as string || null,
        description: formData.get("description") as string || null,
        price: formData.get("price") ? parseFloat(formData.get("price") as string) : null,
        rating: 0,
        tasting_notes: formData.get("tastingNotes") ? 
          (formData.get("tastingNotes") as string).split(",").map(note => note.trim()) : 
          [],
        altitude: formData.get("altitude") as string || null,
        variety: formData.get("variety") as string || null,
        harvest: formData.get("harvest") as string || null,
        image_url: imageUrl
      }

      const { data: bean, error } = await supabase
        .from('beans')
        .insert([beanData])
        .select()
        .single()

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['beans'] })

      setOpen(false)
      toast({
        title: "Success",
        description: "Bean added successfully"
      })

      router.push(`/beans/${bean.id}`)
    } catch (error) {
      console.error('Error adding bean:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add bean",
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
          Add Coffee Bean
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Coffee Bean</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pr-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label>Roaster *</Label>
              <Select value={selectedRoaster} onValueChange={setSelectedRoaster}>
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

          <div className="space-y-2">
            <Label>Photo</Label>
            {photoPreview ? (
              <div className="relative mt-2 w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={photoPreview}
                  alt="Bean photo preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
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
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Upload Photo</span>
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" name="origin" placeholder="e.g., Ethiopia, Yirgacheffe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="process">Process</Label>
              <Input id="process" name="process" placeholder="e.g., Washed, Natural" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roastLevel">Roast Level</Label>
              <Input id="roastLevel" name="roastLevel" placeholder="e.g., Light, Medium, Dark" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the coffee bean..."
              className="h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tastingNotes">Tasting Notes</Label>
            <Input
              id="tastingNotes"
              name="tastingNotes"
              placeholder="e.g., Chocolate, Berries, Citrus (comma-separated)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altitude">Altitude</Label>
              <Input id="altitude" name="altitude" placeholder="e.g., 1800-2000m" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input id="variety" name="variety" placeholder="e.g., Bourbon, Typica" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvest">Harvest</Label>
            <Input id="harvest" name="harvest" placeholder="e.g., Spring 2024" />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Bean"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}