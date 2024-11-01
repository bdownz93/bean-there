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
  addReview: (review: Omit<Review, "id" | "date">) => void
  updateReview: (reviewId: string | number, content: string, rating: number) => void
  deleteReview: (reviewId: string | number) => void
  getReviews: () => Review[]
  getBeanReviews: (beanId: string) => Review[]
  toggleVisited: (roasterId: string) => void
  updateUserProfile: (data: {
    name: string
    bio: string
    favoriteCoffeeStyles: string[]
  }) => void
}