import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RoasterNotFound() {
  return (
    <div className="container mx-auto py-16">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Roaster Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We couldn&apos;t find the roaster you&apos;re looking for.
          </p>
          <Link href="/roasters">
            <Button>Browse All Roasters</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}