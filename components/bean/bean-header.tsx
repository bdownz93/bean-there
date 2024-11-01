"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search } from "lucide-react"

interface BeanHeaderProps {
  onSearch?: (search: string) => void
}

export function BeanHeader({ onSearch }: BeanHeaderProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coffee Beans</h1>
          <p className="text-muted-foreground">
            Explore exceptional coffee beans from the world&apos;s finest roasters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Origin
          </Button>
          <Button variant="outline">
            Roast Level
          </Button>
          <Button variant="outline">
            Price
          </Button>
        </div>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Search beans..."
          onChange={handleSearch}
          className="h-9"
          autoComplete="off"
        />
        <Button size="icon" className="h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}