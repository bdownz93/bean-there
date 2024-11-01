"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import Link from "next/link"

export function PopularUsers() {
  const { users } = useStore()
  const popularUsers = Object.values(users || {}).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Reviewers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    href={`/profile/${user.id}`}
                    className="font-medium hover:underline"
                  >
                    {user.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {(user.reviews || []).length} reviews
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