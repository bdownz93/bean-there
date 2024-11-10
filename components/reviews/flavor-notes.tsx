"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FlavorNotesProps {
  notes: string[]
  selectedNotes: string[]
  onToggle: (note: string) => void
  limit?: number
}

export function FlavorNotes({ notes, selectedNotes, onToggle, limit = 12 }: FlavorNotesProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedNotes = showAll ? notes : notes.slice(0, limit)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayedNotes.map((note) => (
          <Badge
            key={note}
            variant={selectedNotes.includes(note) ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent"
            onClick={() => onToggle(note)}
          >
            {note}
          </Badge>
        ))}
      </div>
      {notes.length > limit && (
        <Button
          type="button" // Explicitly set button type to prevent form submission
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={(e) => {
            e.preventDefault() // Prevent any form submission
            setShowAll(!showAll)
          }}
        >
          {showAll ? (
            <span className="flex items-center gap-1">
              Show Less <ChevronUp className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Show More <ChevronDown className="h-4 w-4" />
            </span>
          )}
        </Button>
      )}
    </div>
  )
}