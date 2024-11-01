import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Coffee Bean Not Found</h2>
      <p className="text-muted-foreground mb-8">
        Sorry, we couldn&apos;t find the coffee bean you&apos;re looking for.
      </p>
      <Link href="/beans">
        <Button>Browse All Coffee Beans</Button>
      </Link>
    </div>
  )
}