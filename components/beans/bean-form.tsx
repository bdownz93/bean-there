'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface Roaster {
  id: string
  name: string
}

interface BeanFormProps {
  onSuccess?: () => void
}

export function BeanForm({ onSuccess }: BeanFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [roasters, setRoasters] = useState<Roaster[]>([])
  const [formData, setFormData] = useState({
    name: "",
    roaster_id: "",
    origin: "",
    process: "",
    roast_level: "",
    description: "",
    price: "",
    weight: "",
    purchase_url: "",
  })

  useEffect(() => {
    async function loadRoasters() {
      try {
        const { data, error } = await supabase
          .from('roasters')
          .select('id, name')
          .order('name')

        if (error) throw error
        setRoasters(data || [])
      } catch (error) {
        console.error('Error loading roasters:', error)
        toast({
          title: "Error",
          description: "Failed to load roasters. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadRoasters()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('beans')
        .insert([{
          ...formData,
          price: parseFloat(formData.price) || 0,
          weight: parseInt(formData.weight) || 0,
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Bean added successfully!",
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error adding bean:', error)
      toast({
        title: "Error",
        description: "Failed to add bean. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const roastLevels = [
    "Light",
    "Medium-Light",
    "Medium",
    "Medium-Dark",
    "Dark",
  ]

  const processes = [
    "Washed",
    "Natural",
    "Honey",
    "Anaerobic",
    "Other",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Bean</CardTitle>
        <CardDescription>
          Add a new coffee bean to the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bean Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roaster">Roaster</Label>
            <Select
              value={formData.roaster_id}
              onValueChange={(value) => handleChange('roaster_id', value)}
              required
            >
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

          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="process">Process</Label>
            <Select
              value={formData.process}
              onValueChange={(value) => handleChange('process', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a process" />
              </SelectTrigger>
              <SelectContent>
                {processes.map((process) => (
                  <SelectItem key={process} value={process}>
                    {process}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roast_level">Roast Level</Label>
            <Select
              value={formData.roast_level}
              onValueChange={(value) => handleChange('roast_level', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a roast level" />
              </SelectTrigger>
              <SelectContent>
                {roastLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (g)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_url">Purchase URL</Label>
            <Input
              id="purchase_url"
              type="url"
              value={formData.purchase_url}
              onChange={(e) => handleChange('purchase_url', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Bean"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
