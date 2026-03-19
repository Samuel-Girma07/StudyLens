import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import {
  fsrsInstance,
  dbToFsrsCard,
  Rating,
  type Card,
} from "@/lib/fsrs"

// ============================================
// POST /api/review/[id] - Submit a review
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: reviewCardId } = await params
    const body = await request.json()
    const { rating } = body

    // Validate rating (1=Again, 2=Hard, 3=Good, 4=Easy)
    if (![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    // Get the review card
    const reviewCard = await db.reviewCard.findFirst({
      where: {
        id: reviewCardId,
        userId: user.id,
      },
      include: {
        resource: true,
      },
    })

    if (!reviewCard) {
      return NextResponse.json({ error: "Review card not found" }, { status: 404 })
    }

    const now = new Date()

    // Convert to FSRS card format
    const fsrsCard: Card = dbToFsrsCard({
      due: reviewCard.due,
      stability: reviewCard.stability,
      difficulty: reviewCard.difficulty,
      elapsedDays: reviewCard.elapsedDays,
      scheduledDays: reviewCard.scheduledDays,
      learningSteps: reviewCard.learningSteps,
      reps: reviewCard.reps,
      lapses: reviewCard.lapses,
      state: reviewCard.state,
      lastReview: reviewCard.lastReview,
    })

    // Get the scheduling result from FSRS
    const schedulingResult = fsrsInstance.repeat(fsrsCard, now)
    const result = schedulingResult[rating as Rating]

    const newCard = result.card
    const log = result.log

    // Update the review card with new FSRS values
    const updatedCard = await db.reviewCard.update({
      where: { id: reviewCardId },
      data: {
        due: newCard.due,
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        elapsedDays: newCard.elapsed_days,
        scheduledDays: newCard.scheduled_days,
        learningSteps: newCard.learning_steps,
        reps: newCard.reps,
        lapses: newCard.lapses,
        state: newCard.state,
        lastReview: now,
      },
    })

    // Create review log for history
    await db.reviewLog.create({
      data: {
        userId: user.id,
        reviewCardId: reviewCardId,
        resourceId: reviewCard.resourceId,
        rating: rating,
        state: log.state,
        due: log.due,
        stability: log.stability,
        difficulty: log.difficulty,
        elapsedDays: log.elapsed_days,
        scheduledDays: log.scheduled_days,
        learningSteps: log.learning_steps,
      },
    })

    // Get updated stats
    const dueToday = await db.reviewCard.count({
      where: {
        userId: user.id,
        due: { lte: now },
      },
    })

    return NextResponse.json({
      success: true,
      card: {
        id: updatedCard.id,
        due: updatedCard.due,
        stability: updatedCard.stability,
        difficulty: updatedCard.difficulty,
        state: updatedCard.state,
        scheduledDays: updatedCard.scheduledDays,
      },
      stats: {
        dueToday,
      },
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// DELETE /api/review/[id] - Remove from review queue
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: reviewCardId } = await params

    // Delete the review card
    await db.reviewCard.deleteMany({
      where: {
        id: reviewCardId,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
