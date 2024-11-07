export interface Bean {
  id: string
  name: string
  roaster?: string
  roasterId?: string
  origin: string
  roastLevel: string
  process: string
  description: string
  price: number
  weight?: number
  rating: number
  tastingNotes: string[]
  altitude: string
  variety: string
  harvest: string
  image?: string
  flavorProfile?: Array<{
    name: string
    intensity: number
  }>
  reviews?: Array<Review>
  slug?: string
}

export interface Review {
  id: number | string
  rating: number
  content: string
  date: string
  bean?: string
  beanId?: string
  roaster?: string
  brewMethod?: string
  flavorNotes?: string[]
  userId: string
  userName: string
  userImage: string
}

export interface Roaster {
  id: string
  slug: string
  name: string
  location: string
  description: string
  rating: number
  logo?: string
  specialties: string[]
  coordinates: {
    lat: number
    lng: number
  }
  beans: Bean[]
}