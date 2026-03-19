// ============================================
// FSRS (Free Spaced Repetition Scheduler) Utility
// Using ts-fsrs library for the FSRS-5 algorithm
// ============================================

import {
  fsrs,
  createEmptyCard,
  Rating,
  State,
  Card,
  FSRSParameters,
  generatorParameters,
  RecordLogItem,
} from "ts-fsrs"

// FSRS state enum mapping
export const CardState = {
  New: 0,
  Learning: 1,
  Review: 2,
  Relearning: 3,
} as const

// Rating enum for user responses
export const ReviewRating = {
  Again: 1,  // Forgot completely
  Hard: 2,   // Remembered with difficulty
  Good: 3,   // Remembered correctly
  Easy: 4,   // Remembered instantly
} as const

// Create FSRS instance with optimized parameters
const defaultParams: FSRSParameters = generatorParameters({
  maximum_interval: 365,      // Cap at 1 year
  enable_fuzz: true,          // Add slight randomness to intervals
  enable_short_term: true,    // Enable short-term scheduling
  w: [                        // Optimized weights for learning
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
  ],
})

export const fsrsInstance = fsrs(defaultParams)

// Create a new review card with FSRS defaults
export function createNewReviewCard(now: Date = new Date()): {
  due: Date
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  state: number
} {
  const card = createEmptyCard(now)
  
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
  }
}

// Convert database fields to FSRS Card type
export function dbToFsrsCard(dbCard: {
  due: Date
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  state: number
  lastReview: Date | null
}): Card {
  return {
    due: dbCard.due,
    stability: dbCard.stability,
    difficulty: dbCard.difficulty,
    elapsed_days: dbCard.elapsedDays,
    scheduled_days: dbCard.scheduledDays,
    learning_steps: dbCard.learningSteps,
    reps: dbCard.reps,
    lapses: dbCard.lapses,
    state: dbCard.state as State,
    last_review: dbCard.lastReview || undefined,
  }
}

// Get next review schedule based on rating
export function getNextReviewSchedule(
  card: Card,
  rating: Rating,
  now: Date = new Date()
): RecordLogItem {
  const schedulingCards = fsrsInstance.repeat(card, now)
  return schedulingCards[rating]
}

// Calculate due status for a card
export function getDueStatus(due: Date): "overdue" | "due" | "upcoming" | "future" {
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  
  if (diffMs < 0) return "overdue"
  if (diffHours < 24) return "due"
  if (diffDays <= 7) return "upcoming"
  return "future"
}

// Format next review time for display
export function formatNextReview(due: Date): string {
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMs < 0) return "Overdue"
  if (diffMins < 60) return `In ${diffMins} min`
  if (diffHours < 24) return `In ${diffHours} hr`
  if (diffDays === 1) return "Tomorrow"
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`
  return `In ${Math.round(diffDays / 30)} months`
}

// Get interval label for rating buttons
export function getIntervalLabel(card: Card, rating: Rating, now: Date = new Date()): string {
  const schedulingCards = fsrsInstance.repeat(card, now)
  const scheduled = schedulingCards[rating]
  const scheduledDays = scheduled.card.scheduled_days
  
  if (scheduledDays < 1) return "<1 day"
  if (scheduledDays < 2) return "1 day"
  if (scheduledDays < 7) return `${Math.round(scheduledDays)} days`
  if (scheduledDays < 14) return "1 week"
  if (scheduledDays < 30) return `${Math.round(scheduledDays / 7)} weeks`
  if (scheduledDays < 60) return "1 month"
  return `${Math.round(scheduledDays / 30)} months`
}

// Export types - re-export from ts-fsrs
export type { Card, RecordLogItem } from "ts-fsrs"
export { Rating, State } from "ts-fsrs"
