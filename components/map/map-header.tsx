"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"
import { roasters } from "@/lib/data"
import type { Roaster } from "@/lib/types"

interface MapHeaderProps {
  onFilter: (roasters: Roaster[]) => void
}

export function MapHeader({ onFilter }: MapHeaderProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value.toLowerCase()
    const filtered = roasters.filter(
      (roaster) =>
        roaster.name.toLowerCase().includes(search) ||
        roaster.location.toLowerCase().includes(search)
    )
    onFilter(filtered)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coffee Map</h1>
        <p className="text-muted-foreground">
          Discover coffee roasters and shops near you
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search locations..."
          className="w-[200px]"
          onChange={handleSearch}
          autoComplete="off"
        />
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
    </div>
  )
}