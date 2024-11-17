export interface User {
  id: string
  username: string
  name: string
  avatar_url: string
  bio?: string
  favorite_coffee_styles?: string[]
  created_at: string
  updated_at: string
}

export interface UserStats {
  user_id: string
  beans_tried: number
  roasters_visited: number
  total_reviews: number
  unique_origins: number
  roasters_created: number
  experience_points: number
  level: number
  created_at: string
  updated_at: string
}

export interface Roaster {
  id: string
  created_by?: string
  slug: string
  name: string
  location: string
  description: string
  website_url?: string
  phone?: string
  logo_url?: string
  rating: number
  coordinates: {
    lat: number
    lng: number
  }
  specialties: string[]
  created_at: string
  updated_at: string
  beans?: Bean[]
}

export interface Bean {
  id: string
  created_by?: string
  roaster_id: string
  name: string
  slug: string
  origin?: string
  process?: string
  roast_level?: string
  description?: string
  price?: number
  rating?: number
  tasting_notes?: string[]
  flavor_profile?: {
    [key: string]: number
  }
  altitude?: string
  variety?: string
  harvest?: string
  created_at: string
  updated_at: string
  roaster?: Roaster
  image_url?: string
}

export interface Review {
  id: string
  user_id: string
  bean_id: string
  rating: number
  content?: string
  brew_method?: string
  grind_size?: string
  flavor_notes?: string[]
  photo_url?: string
  aroma?: number
  body?: number
  acidity?: number
  sweetness?: number
  aftertaste?: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
  bean?: {
    id: string
    name: string
    roaster: Roaster
  }
}

export interface Location {
  name: string
  lat: number
  lng: number
}

export interface ReviewLike {
  id: string
  user_id: string
  review_id: string
  created_at: string
}

export interface ReviewComment {
  id: string
  user_id: string
  review_id: string
  content: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
}