import type { Roaster, Bean, Review, User } from '../types'

export interface StoreState {
  roasters: Roaster[]
  reviews: Review[]
  visitedRoasters: string[]
  triedBeans: string[]
  currentUser: User
  users: Record<string, User>
  addRoaster: (roaster: Omit<Roaster, "id">) => void
  addBean: (roasterId: string, bean: Omit<Bean, "id">) => void
  addReview: (review: Omit<Review, "id" | "createdAt">) => Promise<void>
  updateReview: (reviewId: string, content: string, rating: number) => void
  deleteReview: (reviewId: string) => void
  toggleVisited: (roasterId: string) => void
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
}