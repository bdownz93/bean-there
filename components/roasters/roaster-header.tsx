"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Map, Search } from "lucide-react"

interface RoasterHeaderProps {
  showMap: boolean
  onToggleMap: () => void
  onSearch: (query: string) => void
}

export function RoasterHeader({ showMap, onToggleMap, onSearch }: RoasterHeaderProps) {
  return (
    <div className="space-y-4 flex-1 mr-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coffee Roasters</h1>
          <p className="text-muted-foreground">
            Discover and explore artisanal coffee roasters from around the world
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onToggleMap}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">{showMap ? "Hide Map" : "Show Map"}</span>
            <span className="sm:hidden">Map</span>
          </Button>
          <Button variant="outline" className="sm:flex hidden">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <Input
            type="search"
            placeholder="Search roasters..."
            className="h-9"
            onChange={(e) => onSearch(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" className="sm:hidden">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
    </div>
  )
}