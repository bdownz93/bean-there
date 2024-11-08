"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { User } from "lucide-react"

export function PopularUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['popular-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          username,
          avatar_url,
          reviews:reviews(count)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Reviewers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Reviewers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    href={`/profile/${user.username}`}
                    className="font-medium hover:underline"
                  >
                    {user.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {user.reviews?.[0]?.count || 0} reviews
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Follow</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}