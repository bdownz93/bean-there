import type { User } from '../types'

export const mockCurrentUser: User = {
  id: "current-user",
  username: "coffeemaster",
  name: "Coffee Master",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current-user",
  bio: "Coffee enthusiast and reviewer",
  joinedDate: new Date().toISOString(),
  followers: [],
  following: [],
  reviews: [],
  badges: [
    {
      id: "1",
      name: "Coffee Explorer",
      description: "Tried 10 different coffee beans",
      icon: "🌟",
      earnedDate: new Date().toISOString()
    }
  ],
  triedBeans: [],
  level: 1,
  reviewCount: 0,
  favoriteCoffeeStyles: ["Light Roast", "Pour Over", "Single Origin"]
}

export const mockUsers: Record<string, User> = {
  "current-user": mockCurrentUser,
  "user1": {
    id: "user1",
    username: "beanqueen",
    name: "Bean Queen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=beanqueen",
    bio: "Coffee roaster and taster",
    joinedDate: new Date().toISOString(),
    followers: [],
    following: [],
    reviews: [],
    badges: [],
    triedBeans: [],
    level: 2,
    reviewCount: 5,
    favoriteCoffeeStyles: ["Dark Roast", "Espresso"]
  },
  "user2": {
    id: "user2",
    username: "brewmaster",
    name: "Brew Master",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=brewmaster",
    bio: "Professional barista",
    joinedDate: new Date().toISOString(),
    followers: [],
    following: [],
    reviews: [],
    badges: [],
    triedBeans: [],
    level: 3,
    reviewCount: 10,
    favoriteCoffeeStyles: ["Medium Roast", "Cold Brew"]
  }
}