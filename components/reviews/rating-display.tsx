'use client';

import { RatingInput } from "./rating-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RatingDisplayProps {
  rating: {
    id: string;
    rating: number;
    review_text: string;
    brewing_method: string;
    aroma_notes: string[];
    flavor_notes: string[];
    created_at: string;
    user: {
      id: string;
      email: string;
      user_metadata?: {
        full_name?: string;
        avatar_url?: string;
      };
    };
  };
}

export function RatingDisplay({ rating }: RatingDisplayProps) {
  const userName = rating.user.user_metadata?.full_name || rating.user.email.split('@')[0];
  const avatarUrl = rating.user.user_metadata?.avatar_url;
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="font-semibold">{userName}</div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
          </div>
        </div>
        <RatingInput value={rating.rating} readOnly size="sm" className="ml-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Brewed with</div>
          <Badge variant="outline">{rating.brewing_method}</Badge>
        </div>

        {rating.aroma_notes.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">Aroma Notes</div>
            <div className="flex flex-wrap gap-1">
              {rating.aroma_notes.map((note) => (
                <Badge key={note} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {rating.flavor_notes.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">Flavor Notes</div>
            <div className="flex flex-wrap gap-1">
              {rating.flavor_notes.map((note) => (
                <Badge key={note} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm">{rating.review_text}</div>
      </CardContent>
    </Card>
  );
}
