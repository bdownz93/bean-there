import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  )
}