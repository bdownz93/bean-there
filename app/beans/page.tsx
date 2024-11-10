import { BeansClient } from "@/components/bean/beans-client"
import { getAllBeans, getAllRoasters } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function BeansPage() {
  try {
    const [beans, roasters] = await Promise.all([
      getAllBeans(),
      getAllRoasters()
    ])

    if (!beans || !roasters) {
      throw new Error('Failed to load data')
    }

    return <BeansClient initialBeans={beans} roasters={roasters} />
  } catch (error) {
    console.error("Error loading beans page:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Unable to load beans. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}