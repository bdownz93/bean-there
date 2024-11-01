export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roasters: {
        Row: {
          id: string
          slug: string | null
          name: string
          location: string | null
          description: string | null
          logo_url: string | null
          rating: number | null
          coordinates: Json | null
          specialties: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug?: string | null
          name: string
          location?: string | null
          description?: string | null
          logo_url?: string | null
          rating?: number | null
          coordinates?: Json | null
          specialties?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string | null
          name?: string
          location?: string | null
          description?: string | null
          logo_url?: string | null
          rating?: number | null
          coordinates?: Json | null
          specialties?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      beans: {
        Row: {
          id: string
          roaster_id: string
          name: string
          slug: string | null
          origin: string | null
          process: string | null
          roast_level: string | null
          description: string | null
          price: number | null
          rating: number | null
          image_url: string | null
          tasting_notes: string[] | null
          flavor_profile: Json | null
          altitude: string | null
          variety: string | null
          harvest: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roaster_id: string
          name: string
          slug?: string | null
          origin?: string | null
          process?: string | null
          roast_level?: string | null
          description?: string | null
          price?: number | null
          rating?: number | null
          image_url?: string | null
          tasting_notes?: string[] | null
          flavor_profile?: Json | null
          altitude?: string | null
          variety?: string | null
          harvest?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roaster_id?: string
          name?: string
          slug?: string | null
          origin?: string | null
          process?: string | null
          roast_level?: string | null
          description?: string | null
          price?: number | null
          rating?: number | null
          image_url?: string | null
          tasting_notes?: string[] | null
          flavor_profile?: Json | null
          altitude?: string | null
          variety?: string | null
          harvest?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          bean_id: string
          rating: number
          content: string | null
          brew_method: string | null
          flavor_notes: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bean_id: string
          rating: number
          content?: string | null
          brew_method?: string | null
          flavor_notes?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bean_id?: string
          rating?: number
          content?: string | null
          brew_method?: string | null
          flavor_notes?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}