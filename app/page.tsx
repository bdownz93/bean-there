import { BeanList } from "@/components/bean/bean-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { roasters } from "@/lib/data"
import Link from "next/link"
import { Coffee, MapPin, Star, TrendingUp } from "lucide-react"
import { RoasterCard } from "@/components/roaster/roaster-card"
import { RecentReviewsWrapper } from "@/components/reviews/recent-reviews-wrapper"
import { ReviewCount } from "@/components/stats/review-count"

export default function Home() {
  // Get featured beans from our roasters data
  const featuredBeans = roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      ...bean,
      roaster: roaster.name
    }))
  ).slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div 
          className="absolute inset-0 z-0 opacity-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-24">
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
                <Button size="lg" variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-white">
                  <MapPin className="h-5 w-5" />
                  Find Roasters
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{roasters.length}</div>
                  <div className="text-muted-foreground">Featured Roasters</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {roasters.reduce((acc, r) => acc + r.beans.length, 0)}
                  </div>
                  <div className="text-muted-foreground">Unique Beans</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <ReviewCount />
                  <div className="text-muted-foreground">Community Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Featured Beans Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Beans</h2>
              <p className="text-muted-foreground">
                Hand-picked selections from our finest roasters
              </p>
            </div>
            <Link href="/beans">
              <Button variant="outline">View All Beans</Button>
            </Link>
          </div>
          <BeanList beans={featuredBeans} />
        </section>

        {/* Featured Roasters Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Top Roasters</h2>
              <p className="text-muted-foreground">
                Meet the craftspeople behind your perfect cup
              </p>
            </div>
            <Link href="/roasters">
              <Button variant="outline">View All Roasters</Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roasters.slice(0, 3).map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} />
            ))}
          </div>
        </section>

        {/* Recent Reviews Section */}
        <RecentReviewsWrapper />
      </div>
    </div>
  )
}