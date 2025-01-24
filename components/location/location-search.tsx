"use client"

import { useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Location {
  name: string
  lat: number
  lng: number
}

interface LocationSearchProps {
  onSelect: (location: Location) => void
  selectedLocation: Location | null
}

const NOMINATIM_API = "https://nominatim.openstreetmap.org"

export function LocationSearch({ onSelect, selectedLocation }: LocationSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)

  const searchLocations = async (search: string) => {
    if (!search || search.length < 3) {
      setLocations([])
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en"
          }
        }
      )

      if (!response.ok) throw new Error("Failed to fetch locations")

      const data = await response.json()
      const formattedLocations = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }))

      setLocations(formattedLocations)
    } catch (error) {
      console.error("Error searching locations:", error)
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) searchLocations(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLocation ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{selectedLocation.name}</span>
            </div>
          ) : (
            <span>Search for a location...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search locations..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                "Searching locations..."
              ) : search.length < 3 ? (
                "Type at least 3 characters to search"
              ) : (
                "No locations found"
              )}
            </CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location.name}
                  value={location.name}
                  onSelect={() => {
                    onSelect(location)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLocation?.name === location.name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{location.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}