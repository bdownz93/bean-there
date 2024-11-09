"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

const COFFEE_STYLES = [
  "Light Roast", "Medium Roast", "Dark Roast",
  "Single Origin", "Blend", "Espresso",
  "Pour Over", "French Press", "Cold Brew",
  "Specialty", "Traditional", "Organic"
]

const BREWING_METHODS = [
  "Espresso Machine", "Pour Over", "French Press",
  "AeroPress", "Moka Pot", "Cold Brew",
  "Chemex", "V60", "Clever Dripper"
]

interface ProfilePreferencesProps {
  userId: string
}

export function ProfilePreferences({ userId }: ProfilePreferencesProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [preferences, setPreferences] = useState({
    roastLevel: 50,
    acidity: 50,
    sweetness: 50,
    body: 50
  })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-preferences', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data.favorite_coffee_styles) {
        setSelectedStyles(data.favorite_coffee_styles)
      }
      if (data.coffee_preferences) {
        setPreferences(data.coffee_preferences)
      }

      return data
    }
  })

  const updatePreferences = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('users')
        .update({
          favorite_coffee_styles: selectedStyles,
          coffee_preferences: preferences
        })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-preferences'] })
      toast({
        title: "Preferences updated",
        description: "Your coffee preferences have been saved."
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      })
    }
  })

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Favorite Coffee Styles</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {COFFEE_STYLES.map((style) => (
              <Badge
                key={style}
                variant={selectedStyles.includes(style) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleStyle(style)}
              >
                {style}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Taste Preferences</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Preferred Roast Level</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Light</span>
                  <Slider
                    value={[preferences.roastLevel]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, roastLevel: value }))}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">Dark</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Acidity</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Low</span>
                  <Slider
                    value={[preferences.acidity]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, acidity: value }))}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">High</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Sweetness</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Low</span>
                  <Slider
                    value={[preferences.sweetness]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, sweetness: value }))}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">High</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Body</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Light</span>
                  <Slider
                    value={[preferences.body]}
                    onValueChange={([value]) => setPreferences(prev => ({ ...prev, body: value }))}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">Full</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => updatePreferences.mutate()}
              disabled={updatePreferences.isPending}
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Brewing Methods</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BREWING_METHODS.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={method}
                  className="form-checkbox h-4 w-4"
                />
                <label htmlFor={method} className="text-sm">
                  {method}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}