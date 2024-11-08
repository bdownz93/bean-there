"use client"

import { useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Location {
  name: string
  lat: number
  lng: number
  placeId: string // Added for unique identification
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
}

const NOMINATIM_API = "https://nominatim.openstreetmap.org"

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [value, setValue] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchLocations = async (search: string) => {
    if (!search || search.length < 3) {
      setLocations([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BeanThereDoneThat/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }

      const formattedLocations = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        placeId: item.place_id.toString() // Use place_id as unique identifier
      })).filter(location => 
        !isNaN(location.lat) && 
        !isNaN(location.lng) && 
        location.name
      )
      
      setLocations(formattedLocations)
      
      if (formattedLocations.length === 0) {
        setError("No locations found")
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      setError("Failed to search locations. Please try again.")
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        searchLocations(value)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [value])

  if (!mounted) {
    return (
      <Button variant="outline" className="w-full justify-between">
        Search for a location...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  const renderLocationList = () => (
    <Command shouldFilter={false}>
      <CommandInput 
        placeholder="Search locations..." 
        value={value}
        onValueChange={setValue}
      />
      <CommandList>
        {loading && (
          <CommandEmpty>Searching locations...</CommandEmpty>
        )}
        {!loading && error && (
          <CommandEmpty>{error}</CommandEmpty>
        )}
        {!loading && !error && value.length < 3 && (
          <CommandEmpty>Enter at least 3 characters to search...</CommandEmpty>
        )}
        {locations.length > 0 && (
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location.placeId}
                value={location.name}
                onSelect={() => {
                  setValue(location.name)
                  onLocationSelect(location)
                  setOpen(false)
                  setDialogOpen(false)
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {location.name}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === location.name ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => setDialogOpen(true)}
          >
            {value || "Search for a location..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {renderLocationList()}
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Search Location</DialogTitle>
          </DialogHeader>
          {renderLocationList()}
        </DialogContent>
      </Dialog>
    </>
  )
}