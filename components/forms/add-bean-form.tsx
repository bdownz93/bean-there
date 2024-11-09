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
import { supabase } from "@/lib/supabase"
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
import { Coffee } from "lucide-react"
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
      const slug = name.toLowerCase().replace(/\s+/g, "-")
      
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
        image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60",
        tasting_notes: formData.get("tastingNotes") ? 
          (formData.get("tastingNotes") as string).split(",").map(note => note.trim()) : 
          [],
        altitude: formData.get("altitude") as string || null,
        variety: formData.get("variety") as string || null,
        harvest: formData.get("harvest") as string || null
      }

      const { error } = await supabase
        .from('beans')
        .insert([beanData])

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['beans'] })

      setOpen(false)
      toast({
        title: "Success",
        description: "Bean added successfully"
      })
      router.refresh()
    } catch (error) {
      console.error('Error adding bean:', error)
      toast({
        title: "Error",
        description: "Failed to add bean. Please try again.",
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
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" name="origin" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="process">Process</Label>
              <Input id="process" name="process" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roastLevel">Roast Level</Label>
              <Input id="roastLevel" name="roastLevel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input type="number" step="0.01" id="price" name="price" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tastingNotes">Tasting Notes (comma-separated)</Label>
            <Input id="tastingNotes" name="tastingNotes" placeholder="Chocolate, Caramel, Nuts" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altitude">Altitude</Label>
              <Input id="altitude" name="altitude" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input id="variety" name="variety" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvest">Harvest</Label>
            <Input id="harvest" name="harvest" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Bean"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}