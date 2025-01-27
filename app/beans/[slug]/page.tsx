import { BeanProfile } from "@/components/beans/bean-profile"
import { getBeanBySlug, getBeanByName, fixBeanSlug } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface BeanPageProps {
  params: {
    slug: string
  }
}

export default async function BeanPage({ params }: BeanPageProps) {
  console.log('🟡 Bean page params:', params)

  if (!params.slug) {
    console.error('❌ No slug provided to BeanPage')
    return notFound()
  }

  try {
    // Try to get the bean by its current slug
    console.log('🔍 Fetching bean with slug:', params.slug)
    let bean = await getBeanBySlug(params.slug)

    // If not found, try to find it by name and fix the slug
    if (!bean) {
      console.log('🔄 Bean not found by slug, trying to find by name...')
      const name = params.slug.replace(/-/g, ' ')
      bean = await getBeanByName(name)

      if (bean) {
        console.log('✨ Found bean by name, fixing slug...')
        bean = await fixBeanSlug(bean.name)
      }
    }

    console.log('📦 Bean data:', bean)

    if (!bean) {
      console.log('❌ Bean not found:', params.slug)
      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Sorry, we couldn't find that coffee bean. It may have been removed or the URL might be incorrect.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    console.log('✅ Rendering bean page for:', bean.name)
    return (
      <div className="container mx-auto py-8">
        <BeanProfile bean={bean} />
      </div>
    )
  } catch (error) {
    console.error("❌ Error loading bean:", error)
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Sorry, there was an error loading this coffee bean. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
