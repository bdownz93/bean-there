export interface User {
  id: string
  username: string
  name: string
  avatar_url: string
  bio: string | null
  location: string | null
  experience_points: number
  level: number
  favorite_coffee_styles: string[]
  wishlist_beans: string[]
  favorite_beans: string[]
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirements: Record<string, any>
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  badge: Badge
  earned_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  bean_id: string
  notes: string
  private: boolean
  created_at: string
  updated_at: string
  bean: Bean
}

export interface UserStats {
  reviews_count: number
  roasters_added: number
  beans_added: number
  unique_origins: number
  followers_count: number
  following_count: number
}