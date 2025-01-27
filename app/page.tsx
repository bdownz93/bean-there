import { BeanGrid } from "@/components/beans/grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getServerSupabaseClient } from "@/lib/supabase-server"
import Link from "next/link"
import { Coffee, MapPin, Star, TrendingUp } from "lucide-react"
import { RoasterCard } from "@/components/roasters/roaster-card"
import { RecentReviewsWrapper } from "@/components/reviews/recent-reviews-wrapper"
import { HeroImage } from "@/components/images/hero-image"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBeans() {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
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
    .limit(6)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading beans:', error)
    return []
  }

  return data?.map(bean => ({
    ...bean,
    average_rating: bean.bean_ratings ? 
      Number((bean.bean_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / bean.bean_ratings.length).toFixed(2)) : 
      null,
    total_ratings: bean.bean_ratings?.length || 0
  })) || []
}

async function getRoasters() {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      id,
      name,
      slug,
      location,
      description,
      logo_url,
      hero_image_url,
      created_at,
      updated_at
    `)
    .limit(6)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading roasters:', error)
    return []
  }

  return data || []
}

async function getReviews() {
  const supabase = getServerSupabaseClient()
  
  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from('bean_ratings')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        bean_id,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (reviewsError) {
      console.error('Error loading reviews:', reviewsError)
      return []
    }

    if (!reviews || reviews.length === 0) {
      return []
    }

    // Get unique user IDs from reviews
    const userIds = [...new Set(reviews.map(r => r.user_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, email, raw_user_meta_data')
      .in('id', userIds)

    // Get unique bean IDs from reviews
    const beanIds = [...new Set(reviews.map(r => r.bean_id))]
    const { data: reviewBeans } = await supabase
      .from('beans')
      .select(`
        id,
        name,
        slug,
        roaster:roasters (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .in('id', beanIds)

    // Create maps for quick lookups
    const userMap = new Map(users?.map(u => [u.id, u]) || [])
    const beanMap = new Map(reviewBeans?.map(b => [b.id, b]) || [])

    // Transform reviews with user and bean data
    return reviews.map(review => {
      const user = userMap.get(review.user_id)
      const bean = beanMap.get(review.bean_id)
      return {
        id: review.id,
        rating: review.rating,
        review: review.review_text,
        created_at: review.created_at,
        user: user ? {
          id: user.id,
          username: user.raw_user_meta_data?.username || 'Anonymous',
          avatar_url: user.raw_user_meta_data?.avatar_url
        } : null,
        bean: bean ? {
          id: bean.id,
          name: bean.name,
          slug: bean.slug,
          roaster: bean.roaster
        } : null
      }
    }).filter(r => r.user && r.bean)
  } catch (error) {
    console.error('Error processing reviews:', error)
    return []
  }
}

export default async function Home() {
  const [beans, roasters, reviews] = await Promise.all([
    getBeans(),
    getRoasters(),
    getReviews()
  ])

  return (
    <div className="min-h-screen -mt-14">
      {/* Hero Section */}
      <section className="relative mb-12">
        <HeroImage
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&h=960&fit=crop&q=80"
          alt="Coffee beans being roasted"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              Discover Your Perfect Cup
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Join our community of coffee enthusiasts and explore the world's finest beans
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/beans">
                  Explore Beans
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/roasters">
                  Find Roasters
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Beans */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Beans</h2>
          <Button asChild variant="ghost">
            <Link href="/beans">View All</Link>
          </Button>
        </div>
        <BeanGrid beans={beans} />
      </section>

      {/* Featured Roasters */}
      <section className="container mx-auto px-4 py-8 bg-muted/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Roasters</h2>
          <Button asChild variant="ghost">
            <Link href="/roasters">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roasters?.map((roaster) => (
            <RoasterCard key={roaster.id} roaster={roaster} />
          ))}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Reviews</h2>
          <Button asChild variant="ghost">
            <Link href="/reviews">View All</Link>
          </Button>
        </div>
        <RecentReviewsWrapper initialReviews={reviews} />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8 bg-muted/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviews?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roasters?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Roasters</p>
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
                  <p className="text-2xl font-bold">{beans?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Unique Beans</p>
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
                  <p className="text-2xl font-bold">
                    {Number((beans.reduce((acc, bean) => acc + (bean.average_rating || 0), 0) / beans.length || 0).toFixed(1))}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}