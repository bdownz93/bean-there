import { BeansClient } from "@/components/bean/beans-client"
import { getAllRoasters } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerSupabaseClient } from "@/lib/supabase-server"

export default async function BeansPage() {
  try {
    const supabase = getServerSupabaseClient()
    
    const [{ data: beans, error: beansError }, roasters] = await Promise.all([
      supabase
        .from('beans')
        .select(`
          *,
          roaster:roaster_id (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false }),
      getAllRoasters()
    ])

    if (beansError) {
      console.error("Error loading beans:", beansError)
      throw beansError
    }

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