import { BeanProfile } from "@/components/bean/bean-profile"
import { BeanReviews } from "@/components/bean/bean-reviews"
import { Card, CardContent } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface BeanPageProps {
  params: {
    id: string
  }
}

async function getBeanDetails(id: string) {
  const { data: bean, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roaster_id (
        id,
        name,
        slug,
        location,
        description
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error("Error fetching bean:", error)
    return null
  }
  
  return bean
}

export default async function BeanPage({ params }: BeanPageProps) {
  try {
    const bean = await getBeanDetails(params.id)

    if (!bean) {
      return notFound()
    }

    return (
      <div className="container mx-auto py-8 space-y-8">
        <BeanProfile bean={bean} />
        <BeanReviews bean={bean} />
      </div>
    )
  } catch (error) {
    console.error("Error loading bean:", error)
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Error loading coffee bean. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}