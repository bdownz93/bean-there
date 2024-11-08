"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          An error occurred while loading this page.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}