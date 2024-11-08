"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreState } from './store/types'

const initialState = {
  reviews: [],
  visitedRoasters: [],
  triedBeans: [],
  currentUser: {
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
  },
  users: {
    "current-user": {
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
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...initialState,

      addReview: async (newReview) => {
        const reviewId = Math.random().toString(36).substr(2, 9)
        const review = {
          ...newReview,
          id: reviewId,
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          reviews: Array.isArray(state.reviews) ? [...state.reviews, review] : [review],
          currentUser: {
            ...state.currentUser,
            reviews: [...state.currentUser.reviews, reviewId],
            reviewCount: state.currentUser.reviewCount + 1,
            triedBeans: [...state.currentUser.triedBeans, review.beanId]
          },
          triedBeans: [...state.triedBeans, review.beanId]
        }))
      },

      updateReview: (reviewId, content, rating) =>
        set((state) => ({
          reviews: Array.isArray(state.reviews) 
            ? state.reviews.map(review =>
                review.id === reviewId
                  ? { ...review, content, rating }
                  : review
              )
            : []
        })),

      deleteReview: (reviewId) =>
        set((state) => ({
          reviews: Array.isArray(state.reviews) 
            ? state.reviews.filter(review => review.id !== reviewId)
            : [],
          currentUser: {
            ...state.currentUser,
            reviews: state.currentUser.reviews.filter(id => id !== reviewId),
            reviewCount: Math.max(0, state.currentUser.reviewCount - 1)
          }
        })),

      toggleVisited: (roasterId) =>
        set((state) => ({
          visitedRoasters: state.visitedRoasters.includes(roasterId)
            ? state.visitedRoasters.filter(id => id !== roasterId)
            : [...state.visitedRoasters, roasterId]
        })),

      followUser: (userId) =>
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            following: [...state.currentUser.following, userId]
          },
          users: {
            ...state.users,
            [userId]: {
              ...state.users[userId],
              followers: [...state.users[userId].followers, state.currentUser.id]
            }
          }
        })),

      unfollowUser: (userId) =>
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            following: state.currentUser.following.filter(id => id !== userId)
          },
          users: {
            ...state.users,
            [userId]: {
              ...state.users[userId],
              followers: state.users[userId].followers.filter(id => id !== state.currentUser.id)
            }
          }
        }))
    }),
    {
      name: 'coffee-store',
      partialize: (state) => ({
        reviews: state.reviews,
        visitedRoasters: state.visitedRoasters,
        triedBeans: state.triedBeans,
        currentUser: state.currentUser,
        users: state.users
      })
    }
  )
)