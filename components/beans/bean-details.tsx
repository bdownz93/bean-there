'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarIcon } from "lucide-react"

interface BeanDetailsProps {
  bean: {
    id: string
    name: string
    roaster: {
      id: string
      name: string
    }
    origin: string
    process: string
    roast_level: string
    description: string
    price: number
    weight: number
    purchase_url?: string
  }
  reviews: Array<{
    id: string
    rating: number
    content: string
    created_at: string
    user: {
      id: string
      email: string
    }
    brew_method?: string
    flavor_notes?: string[]
    aroma?: number
    body?: number
    acidity?: number
    sweetness?: number
    aftertaste?: number
  }>
}

export function BeanDetails({ bean, reviews }: BeanDetailsProps) {
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{bean.name}</CardTitle>
              <CardDescription className="text-lg">
                by {bean.roaster.name}
              </CardDescription>
            </div>
            {averageRating > 0 && (
              <div className="flex items-center gap-1">
                <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-medium">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-2">
              {bean.origin && (
                <Badge variant="secondary" className="text-base">
                  {bean.origin}
                </Badge>
              )}
              {bean.process && (
                <Badge variant="outline" className="text-base">
                  {bean.process}
                </Badge>
              )}
              {bean.roast_level && (
                <Badge className="text-base">
                  {bean.roast_level} Roast
                </Badge>
              )}
            </div>

            <p className="text-lg">{bean.description}</p>

            <div className="flex gap-4">
              {bean.price > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="font-medium">${bean.price.toFixed(2)}</div>
                </div>
              )}
              {bean.weight > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="font-medium">{bean.weight}g</div>
                </div>
              )}
              {bean.purchase_url && (
                <div>
                  <div className="text-sm text-muted-foreground">Purchase</div>
                  <a
                    href={bean.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Buy Now
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{review.user.email}</CardTitle>
                      <CardDescription>
                        {new Date(review.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{review.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>{review.content}</p>

                    {review.brew_method && (
                      <div>
                        <div className="font-medium">Brew Method</div>
                        <div>{review.brew_method}</div>
                      </div>
                    )}

                    {review.flavor_notes && review.flavor_notes.length > 0 && (
                      <div>
                        <div className="font-medium">Flavor Notes</div>
                        <div className="flex gap-2 flex-wrap">
                          {review.flavor_notes.map((note) => (
                            <Badge key={note} variant="secondary">
                              {note}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(review.aroma || review.body || review.acidity || review.sweetness || review.aftertaste) && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {review.aroma && (
                          <div>
                            <div className="font-medium">Aroma</div>
                            <div>{review.aroma}/5</div>
                          </div>
                        )}
                        {review.body && (
                          <div>
                            <div className="font-medium">Body</div>
                            <div>{review.body}/5</div>
                          </div>
                        )}
                        {review.acidity && (
                          <div>
                            <div className="font-medium">Acidity</div>
                            <div>{review.acidity}/5</div>
                          </div>
                        )}
                        {review.sweetness && (
                          <div>
                            <div className="font-medium">Sweetness</div>
                            <div>{review.sweetness}/5</div>
                          </div>
                        )}
                        {review.aftertaste && (
                          <div>
                            <div className="font-medium">Aftertaste</div>
                            <div>{review.aftertaste}/5</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {reviews.length === 0 && (
              <div className="text-center text-muted-foreground">
                No reviews yet. Be the first to review this coffee!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
