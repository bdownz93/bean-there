import { BeansPageClient } from "@/components/beans/beans-page-client"
import { getServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function BeansPage() {
  try {
    const supabase = getServerSupabaseClient()

    const [beansResult, roastersResult] = await Promise.all([
      supabase
        .from('beans')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('roasters')
        .select('*')
        .order('name')
    ])

    if (!beansResult.data || !roastersResult.data) {
      throw new Error('Failed to fetch data')
    }

    return (
      <div className="container py-6">
        <BeansPageClient
          initialBeans={beansResult.data}
          roasters={roastersResult.data}
        />
      </div>
    )
  } catch (error) {
    console.error('Error:', error)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    )
  }
}