'use client';

import { RatingInput } from "./rating-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RatingStatsProps {
  stats: {
    average_rating: number;
    total_ratings: number;
    rating_distribution?: Record<number, number>;
    brewing_methods: string[];
    common_aroma_notes: Array<{ note: string; count: number }>;
    common_flavor_notes: Array<{ note: string; count: number }>;
  };
}

export function RatingStats({ stats }: RatingStatsProps) {
  // Calculate percentages for rating distribution
  const ratingDistribution = stats.rating_distribution || {};
  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Rating Overview</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</span>
            <RatingInput value={Math.round(stats.average_rating)} readOnly size="sm" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-sm font-medium mb-2">Rating Distribution</div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="w-8 text-sm text-right">{rating}★</div>
                <Progress 
                  value={((ratingDistribution[rating] || 0) / maxCount) * 100} 
                  className="h-2"
                />
                <div className="w-12 text-sm text-muted-foreground">
                  {ratingDistribution[rating] || 0}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 text-sm text-muted-foreground text-center">
            Based on {stats.total_ratings} {stats.total_ratings === 1 ? 'rating' : 'ratings'}
          </div>
        </div>

        {stats.brewing_methods.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Popular Brewing Methods</div>
            <div className="flex flex-wrap gap-1">
              {stats.brewing_methods.map((method) => (
                <Badge key={method} variant="outline">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {stats.common_aroma_notes.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Common Aroma Notes</div>
              <div className="flex flex-wrap gap-1">
                {stats.common_aroma_notes.slice(0, 5).map(({ note, count }) => (
                  <Badge key={note} variant="secondary">
                    {note} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {stats.common_flavor_notes.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Common Flavor Notes</div>
              <div className="flex flex-wrap gap-1">
                {stats.common_flavor_notes.slice(0, 5).map(({ note, count }) => (
                  <Badge key={note} variant="secondary">
                    {note} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
