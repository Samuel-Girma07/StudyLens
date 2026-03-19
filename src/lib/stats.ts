// ============================================
// SHARED STATISTICS UTILITIES
// Used across dashboard, analytics, and other pages
// ============================================

import { UserInteraction } from "@prisma/client"

/**
 * Calculate learning streak based on user interactions
 * 
 * A streak counts consecutive days where the user had ANY activity
 * (viewed, liked, saved, or reviewed a resource)
 * 
 * @param interactions - Array of user interactions with updatedAt dates
 * @param maxDays - Maximum days to look back (default 30)
 * @returns The current streak count
 */
export function calculateStreak(
  interactions: { updatedAt: Date }[],
  maxDays: number = 30
): number {
  if (!interactions || interactions.length === 0) {
    return 0
  }

  // Get unique activity dates
  const activityDates = new Set<string>()
  interactions.forEach((interaction) => {
    const date = new Date(interaction.updatedAt)
    date.setHours(0, 0, 0, 0)
    activityDates.add(date.toDateString())
  })

  // Start from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const checkDate = new Date(today)

  for (let i = 0; i < maxDays; i++) {
    const dateString = checkDate.toDateString()
    
    if (activityDates.has(dateString)) {
      streak++
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (i === 0) {
      // No activity today, check from yesterday
      // (streak continues if they were active yesterday)
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      // Gap in activity - streak broken
      break
    }
  }

  return streak
}

/**
 * Calculate retention rate from review logs
 * 
 * @param reviews - Array of reviews with ratings
 * @returns Retention percentage (Good + Easy ratings)
 */
export function calculateRetentionRate(
  reviews: { rating: number }[]
): number {
  if (!reviews || reviews.length === 0) {
    return 0
  }

  const successfulReviews = reviews.filter(
    (r) => r.rating >= 3 // Good (3) or Easy (4)
  ).length

  return Math.round((successfulReviews / reviews.length) * 100)
}

/**
 * Get date range for filtering
 */
export function getDateRange(daysAgo: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - daysAgo)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
