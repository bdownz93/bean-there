"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { roasters as initialRoasters } from '../data'
import { mockCurrentUser, mockUsers } from './initial-state'
import type { StoreState } from './types'

const initialState = {
  roasters: initialRoasters,
  reviews: [],
  visitedRoasters: [],
  triedBeans: [],
  currentUser: mockCurrentUser,
  users: mockUsers
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addRoaster: (newRoaster) => 
        set((state) => ({
          roasters: [...state.roasters, {
            ...newRoaster,
            id: Math.random().toString(36).substr(2, 9),
            beans: []
          }]
        })),

      addBean: (roasterId, newBean) =>
        set((state) => ({
          roasters: state.roasters.map(roaster =>
            roaster.id === roasterId
              ? {
                  ...roaster,
                  beans: [...roaster.beans, {
                    ...newBean,
                    id: Math.random().toString(36).substr(2, 9)
                  }]
                }
              : roaster
          )
        })),

      addReview: (newReview) => 
        set((state) => {
          const reviewId = Math.random().toString(36).substr(2, 9)
          const review = {
            ...newReview,
            id: reviewId,
            date: new Date().toISOString()
          }
          
          return {
            reviews: [...(state.reviews || []), review],
            currentUser: {
              ...state.currentUser,
              reviews: [...state.currentUser.reviews, reviewId],
              reviewCount: state.currentUser.reviewCount + 1
            }
          }
        }),

      updateReview: (reviewId, content, rating) =>
        set((state) => ({
          reviews: (state.reviews || []).map(review =>
            review.id === reviewId
              ? { ...review, content, rating }
              : review
          )
        })),

      deleteReview: (reviewId) =>
        set((state) => ({
          reviews: (state.reviews || []).filter(review => review.id !== reviewId),
          currentUser: {
            ...state.currentUser,
            reviews: state.currentUser.reviews.filter(id => id !== reviewId),
            reviewCount: Math.max(0, state.currentUser.reviewCount - 1)
          }
        })),

      getReviews: () => get().reviews || [],
      
      getBeanReviews: (beanId) => 
        (get().reviews || []).filter(review => review.beanId === beanId),

      toggleVisited: (roasterId) =>
        set((state) => ({
          visitedRoasters: state.visitedRoasters.includes(roasterId)
            ? state.visitedRoasters.filter(id => id !== roasterId)
            : [...state.visitedRoasters, roasterId]
        })),

      updateUserProfile: (data) =>
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            name: data.name,
            bio: data.bio,
            favoriteCoffeeStyles: data.favoriteCoffeeStyles
          },
          users: {
            ...state.users,
            [state.currentUser.id]: {
              ...state.users[state.currentUser.id],
              name: data.name,
              bio: data.bio,
              favoriteCoffeeStyles: data.favoriteCoffeeStyles
            }
          }
        }))
    }),
    {
      name: 'coffee-store',
      partialize: (state) => ({
        reviews: state.reviews || [],
        visitedRoasters: state.visitedRoasters,
        triedBeans: state.triedBeans,
        currentUser: state.currentUser,
        users: state.users
      })
    }
  )
)