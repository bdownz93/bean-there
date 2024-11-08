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
  beans: Bean[]
}

export interface Bean {
  id: string
  name: string
  roaster: string
  roasterId: string
  origin: string
  roastLevel: string
  process: string
  description: string
  price: number
  rating: number
  tastingNotes: string[]
  altitude: string
  variety: string
  harvest: string
  image: string
  flavorProfile: FlavorProfile[]
}

export interface FlavorProfile {
  name: string
  intensity: number
}

export interface Review {
  id: string
  userId: string
  userName: string
  userImage: string
  beanId: string
  bean: string
  roaster: string
  rating: number
  content: string
  date: string
  brewMethod?: string
  flavorNotes?: string[]
}

export interface Location {
  name: string
  lat: number
  lng: number
}