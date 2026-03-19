import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { calculateStreak, calculateRetentionRate, getDateRange } from "@/lib/stats"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    })

    // Get all user interactions
    const interactions = await db.userInteraction.findMany({
      where: { userId: user.id },
      include: { resource: true },
    })

    // Calculate stats
    const totalViews = interactions.filter(i => i.viewed).length
    const totalLikes = interactions.filter(i => i.rating === 1).length
    const totalDislikes = interactions.filter(i => i.rating === -1).length
    const totalSaved = interactions.filter(i => i.saved).length

    // Use shared streak calculation
    const streak = calculateStreak(interactions)

    // Subject distribution from interactions
    const subjectDistribution: Record<string, number> = {}
    interactions.forEach((i) => {
      if (i.resource?.subject) {
        subjectDistribution[i.resource.subject] = (subjectDistribution[i.resource.subject] || 0) + 1
      }
    })

    // Type distribution from interactions
    const typeDistribution: Record<string, number> = {}
    interactions.forEach((i) => {
      if (i.resource?.type) {
        typeDistribution[i.resource.type] = (typeDistribution[i.resource.type] || 0) + 1
      }
    })

    // Get recently viewed resources
    const recentInteractions = await db.userInteraction.findMany({
      where: {
        userId: user.id,
        viewed: true,
      },
      include: { resource: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })

    const recentResources = recentInteractions
      .filter(i => i.resource)
      .map((i) => ({
        id: i.resource.id,
        title: i.resource.title,
        type: i.resource.type,
        subject: i.resource.subject,
        thumbnail: i.resource.thumbnail,
        viewedAt: i.updatedAt,
      }))

    // Get most viewed subjects from user's liked resources
    const likedInteractions = interactions.filter(i => i.rating === 1)
    const likedSubjectCounts: Record<string, number> = {}
    likedInteractions.forEach((i) => {
      if (i.resource?.subject) {
        likedSubjectCounts[i.resource.subject] = (likedSubjectCounts[i.resource.subject] || 0) + 1
      }
    })

    // Get user's preferred subjects from profile
    const preferredSubjects = profile ? JSON.parse(profile.subjects) : []
    const preferredFormats = profile ? JSON.parse(profile.formats) : []
    const experienceLevel = profile?.experienceLevel || "beginner"
    const timeCommitment = profile?.timeCommitment || "casual"
    const hasCompletedOnboarding = profile?.onboardingCompleted || false

    // ============================================
    // REVIEW STATS (Spaced Repetition)
    // ============================================
    const now = new Date()
    
    // Total review cards
    const totalReviewCards = await db.reviewCard.count({
      where: { userId: user.id },
    })

    // Cards due today
    const cardsDueToday = await db.reviewCard.count({
      where: {
        userId: user.id,
        due: { lte: now },
      },
    })

    // Get all review logs for retention calculation
    const allReviewLogs = await db.reviewLog.findMany({
      where: { userId: user.id },
      select: { rating: true, reviewedAt: true },
    })

    // Calculate retention rate
    const retentionRate = calculateRetentionRate(allReviewLogs)

    // Reviews today
    const { start: todayStart } = getDateRange(0)
    const reviewsToday = await db.reviewLog.count({
      where: {
        userId: user.id,
        reviewedAt: { gte: todayStart },
      },
    })

    // Total reviews all time
    const totalReviews = allReviewLogs.length

    // Reviews this week
    const { start: weekStart } = getDateRange(7)
    const reviewsThisWeek = await db.reviewLog.count({
      where: {
        userId: user.id,
        reviewedAt: { gte: weekStart },
      },
    })

    // Reviews by rating (for distribution chart)
    const ratingDistribution = await db.reviewLog.groupBy({
      by: ["rating"],
      where: { userId: user.id },
      _count: true,
    })

    const reviewStats = {
      totalCards: totalReviewCards,
      cardsDueToday,
      totalReviews,
      reviewsToday,
      reviewsThisWeek,
      retentionRate,
      ratingDistribution: {
        again: ratingDistribution.find(r => r.rating === 1)?._count || 0,
        hard: ratingDistribution.find(r => r.rating === 2)?._count || 0,
        good: ratingDistribution.find(r => r.rating === 3)?._count || 0,
        easy: ratingDistribution.find(r => r.rating === 4)?._count || 0,
      },
    }

    return NextResponse.json({
      stats: {
        totalViews,
        totalLikes,
        totalDislikes,
        totalSaved,
        streak,
      },
      subjectDistribution,
      typeDistribution,
      preferredSubjects,
      preferredFormats,
      likedSubjectCounts,
      experienceLevel,
      timeCommitment,
      hasCompletedOnboarding,
      recentResources,
      reviewStats,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
