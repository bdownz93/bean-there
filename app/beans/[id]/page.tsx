'use server'

import { getServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"
import { BeanDetailsClient } from "@/components/beans/bean-details-client"

interface BeanPageProps {
  params: {
    id: string
  }
}

export default async function BeanPage({ params }: BeanPageProps) {
  try {
    const supabase = getServerSupabaseClient()

    const [{ data: bean, error: beanError }, { data: reviews, error: reviewsError }] = await Promise.all([
      supabase
        .from('beans')
        .select(`
          *,
          roaster:roaster_id (
            id,
            name
          )
        `)
        .eq('id', params.id)
        .single(),
      supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `)
        .eq('bean_id', params.id)
        .order('created_at', { ascending: false })
    ])

    if (beanError || !bean) {
      return notFound()
    }

    return <BeanDetailsClient bean={bean} reviews={reviews || []} />
  } catch (error) {
    console.error("Error loading bean:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}