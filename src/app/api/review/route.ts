import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// ============================================
// GET /api/review - Fetch due review cards
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const includeUpcoming = searchParams.get("upcoming") === "true"

    const now = new Date()

    // Get due and overdue cards
    const dueCards = await db.reviewCard.findMany({
      where: {
        userId: user.id,
        due: includeUpcoming ? undefined : { lte: now },
      },
      include: {
        resource: true,
      },
      orderBy: [
        { due: "asc" },  // Most overdue first
      ],
      take: limit,
    })

    // Get stats
    const totalCards = await db.reviewCard.count({
      where: { userId: user.id },
    })

    const dueToday = await db.reviewCard.count({
      where: {
        userId: user.id,
        due: { lte: now },
      },
    })

    const newCards = await db.reviewCard.count({
      where: {
        userId: user.id,
        state: 0, // New
      },
    })

    const learningCards = await db.reviewCard.count({
      where: {
        userId: user.id,
        state: { in: [1, 3] }, // Learning or Relearning
      },
    })

    const reviewCards = await db.reviewCard.count({
      where: {
        userId: user.id,
        state: 2, // Review
      },
    })

    // Calculate retention rate from recent reviews
    const recentReviews = await db.reviewLog.findMany({
      where: {
        userId: user.id,
        reviewedAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        rating: true,
        reviewedAt: true,
      },
    })

    const successfulReviews = recentReviews.filter(
      (r) => r.rating >= 3 // Good or Easy
    ).length
    const retentionRate = recentReviews.length > 0
      ? Math.round((successfulReviews / recentReviews.length) * 100)
      : 0

    // Format cards for response
    const formattedCards = dueCards.map((card) => ({
      id: card.id,
      resourceId: card.resourceId,
      title: card.resource.title,
      description: card.resource.description,
      author: card.resource.author,
      type: card.resource.type,
      subject: card.resource.subject,
      thumbnail: card.resource.thumbnail,
      url: card.resource.url,
      difficulty: card.resource.difficulty,
      tags: JSON.parse(card.resource.tags),
      // FSRS fields
      due: card.due,
      stability: card.stability,
      difficulty_score: card.difficulty,
      state: card.state,
      reps: card.reps,
      lapses: card.lapses,
      lastReview: card.lastReview,
      scheduledDays: card.scheduledDays,
    }))

    return NextResponse.json({
      cards: formattedCards,
      stats: {
        total: totalCards,
        dueToday,
        new: newCards,
        learning: learningCards,
        review: reviewCards,
        retentionRate,
        reviewedToday: recentReviews.filter(
          (r) => r.reviewedAt >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ).length,
      },
    })
  } catch (error) {
    console.error("Error fetching review cards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
