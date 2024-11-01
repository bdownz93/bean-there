import { cn } from "@/lib/utils"
import { Coffee } from "lucide-react"

interface LogoProps {
  className?: string
  fill?: "currentColor" | "white"
}

export function Logo({ className, fill = "currentColor" }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Coffee className="h-6 w-6" />
    </div>
  )
}