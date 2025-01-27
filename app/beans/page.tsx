import { BeansPageClient } from "@/components/beans/beans-page-client"
import { getServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BeansPage() {
  try {
    const supabase = getServerSupabaseClient()

    const [beansResult, roastersResult] = await Promise.all([
      supabase
        .from('beans')
        .select(`
          id,
          name,
          slug,
          description,
          origin,
          roast_level,
          image_url,
          created_at,
          updated_at,
          roaster:roasters (
            id,
            name,
            slug,
            logo_url
          ),
          bean_ratings (
            rating
          )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('roasters')
        .select(`
          id,
          name,
          slug,
          location,
          logo_url
        `)
        .order('name')
    ])

    if (beansResult.error) {
      console.error('Error fetching beans:', beansResult.error)
      throw beansResult.error
    }

    if (roastersResult.error) {
      console.error('Error fetching roasters:', roastersResult.error)
      throw roastersResult.error
    }

    // Calculate average rating and total ratings for each bean
    const beansWithStats = beansResult.data?.map(bean => ({
      ...bean,
      average_rating: bean.bean_ratings ? 
        Number((bean.bean_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / bean.bean_ratings.length).toFixed(2)) : 
        null,
      total_ratings: bean.bean_ratings?.length || 0
    })) || []

    return (
      <div className="container py-6">
        <BeansPageClient
          initialBeans={beansWithStats}
          roasters={roastersResult.data || []}
        />
      </div>
    )
  } catch (error) {
    console.error('Error:', error)
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}