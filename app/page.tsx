import { BeanList } from "@/components/bean/bean-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabaseServer } from "@/lib/supabase-server"
import Link from "next/link"
import { Coffee, MapPin, Star, TrendingUp } from "lucide-react"
import { RoasterCard } from "@/components/roaster/roaster-card"
import { RecentReviewsWrapper } from "@/components/reviews/recent-reviews-wrapper"
import { ReviewCount } from "@/components/stats/review-count"

export const revalidate = 0 // disable cache

export default async function Home() {
  try {
    // Get featured beans and roasters
    const [{ data: featuredBeans }, { data: roasters }] = await Promise.all([
      supabaseServer
        .from('featured_beans')
        .select('*')
        .limit(6),
      supabaseServer
        .from('roasters')
        .select('*')
        .limit(6)
    ])

    return (
      <div className="min-h-screen -mt-14">
        {/* Hero Section */}
        <section className="relative bg-black text-white mb-12">
          <div 
            className="absolute inset-0 z-0 opacity-50"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=60')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div className="relative z-10 container mx-auto px-4 py-32 mt-14 max-w-7xl">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Discover Your Perfect Cup
              </h1>
              <p className="text-xl text-gray-300">
                Explore exceptional coffee beans from the world&apos;s finest roasters
              </p>
              <div className="flex gap-4">
                <Link href="/beans">
                  <Button size="lg" className="gap-2">
                    <Coffee className="h-5 w-5" />
                    Explore Beans
                  </Button>
                </Link>
                <Link href="/map">
                  <Button size="lg" variant="outline" className="gap-2">
                    <MapPin className="h-5 w-5" />
                    Find Roasters
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 mb-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Coffee className="h-8 w-8" />
                  <div>
                    <div className="text-2xl font-bold">
                      <ReviewCount />
                    </div>
                    <div className="text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Star className="h-8 w-8" />
                  <div>
                    <div className="text-2xl font-bold">
                      {featuredBeans?.length || 0}
                    </div>
                    <div className="text-muted-foreground">Featured Beans</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <MapPin className="h-8 w-8" />
                  <div>
                    <div className="text-2xl font-bold">
                      {roasters?.length || 0}
                    </div>
                    <div className="text-muted-foreground">Roasters</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8" />
                  <div>
                    <div className="text-2xl font-bold">
                      {featuredBeans?.reduce((acc, bean) => acc + (bean.rating || 0), 0) / featuredBeans?.length || 0}
                    </div>
                    <div className="text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Beans Section */}
        <section className="container mx-auto px-4 mb-12 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Beans</h2>
            <Link href="/beans">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <BeanList beans={featuredBeans || []} />
        </section>

        {/* Featured Roasters Section */}
        <section className="container mx-auto px-4 mb-12 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Roasters</h2>
            <Link href="/roasters">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roasters?.map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} />
            ))}
          </div>
        </section>

        {/* Recent Reviews Section */}
        <section className="container mx-auto px-4 mb-12 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Reviews</h2>
            <Link href="/community">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <RecentReviewsWrapper />
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error loading home page:', error)
    return (
      <div className="min-h-screen container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Unable to load content. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}