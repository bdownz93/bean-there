export interface User {
  id: string
  username: string
  name: string
  avatar: string
  bio: string
  joinedDate: string
  followers: string[]
  following: string[]
  reviews: string[]
  badges: Badge[]
  triedBeans: string[]
  level: number
  reviewCount: number
  favoriteCoffeeStyles: string[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: string
}

export interface Roaster {
  id: string
  name: string
  slug: string
  location: string
  description: string
  logo_url: string
  rating: number
  coordinates: {
    lat: number
    lng: number
  }
  specialties: string[]
  beans?: Bean[]
}

export interface Bean {
  id: string
  name: string
  roaster: string | Roaster
  roaster_id: string
  origin: string | null
  roast_level: string | null
  process: string | null
  description: string | null
  price: number | null
  rating: number | null
  tasting_notes: string[] | null
  altitude: string | null
  variety: string | null
  harvest: string | null
  image_url: string | null
  flavor_profile: FlavorProfile[] | null
}

export interface FlavorProfile {
  name: string
  intensity: number
}

export interface Review {
  id: string
  user_id: string
  bean_id: string
  rating: number
  content: string | null
  brew_method: string | null
  flavor_notes: string[] | null
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