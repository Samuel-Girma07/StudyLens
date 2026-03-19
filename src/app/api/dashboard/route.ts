import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { calculateStreak } from "@/lib/stats"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    })

    // Get user interactions for stats
    const interactions = await db.userInteraction.findMany({
      where: { userId },
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            type: true,
            subject: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Calculate stats
    const totalViews = interactions.filter((i) => i.viewed).length
    const totalLikes = interactions.filter((i) => i.rating === 1).length
    const totalSaved = interactions.filter((i) => i.saved).length

    // Calculate streak using shared utility
    const streak = calculateStreak(interactions)

    // Continue learning - recently viewed resources
    // Use updatedAt as proxy for viewedAt since viewedAt doesn't exist in schema
    const recentViewed = interactions
      .filter((i) => i.viewed)
      .slice(0, 4)
      .map((i) => ({
        id: i.resource.id,
        title: i.resource.title,
        subject: i.resource.subject,
        type: i.resource.type,
        thumbnail: i.resource.thumbnail,
        viewedAt: i.updatedAt,
      }))

    // Get recommendations
    const userProfile = await db.userProfile.findUnique({
      where: { userId },
      include: { user: { include: { interactions: { include: { resource: true } } } } },
    })

    const userSubjects = userProfile?.subjects ? JSON.parse(userProfile.subjects) : []
    const userFormats = userProfile?.formats ? JSON.parse(userProfile.formats) : []

    // Get resources matching user preferences, excluding already interacted
    const interactedIds = interactions.map((i) => i.resourceId)

    // Build where condition dynamically to avoid empty array issues
    const buildRecommendationWhere = (excludeIds: string[]): Prisma.ResourceWhereInput => {
      const where: Prisma.ResourceWhereInput = {}

      // Only add notIn if there are IDs to exclude
      if (excludeIds.length > 0) {
        where.id = { notIn: excludeIds }
      }

      // Build OR conditions only if arrays are non-empty
      const orConditions: Prisma.ResourceWhereInput[] = []
      if (userSubjects.length > 0) {
        orConditions.push({ subject: { in: userSubjects } })
      }
      if (userFormats.length > 0) {
        orConditions.push({ type: { in: userFormats } })
      }

      // Only add OR if there are conditions
      if (orConditions.length > 0) {
        where.OR = orConditions
      }

      return where
    }

    let recommendedResources = await db.resource.findMany({
      where: buildRecommendationWhere(interactedIds),
      take: 3,
      include: {
        _count: { select: { interactions: { where: { rating: 1 } } } },
      },
    })

    // If not enough, get popular resources
    if (recommendedResources.length < 3) {
      const excludeIds = [...interactedIds, ...recommendedResources.map((r) => r.id)]
      const additionalResources = await db.resource.findMany({
        where: excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {},
        take: 3 - recommendedResources.length,
        include: {
          _count: { select: { interactions: { where: { rating: 1 } } } },
        },
        orderBy: { interactions: { _count: "desc" } },
      })
      recommendedResources = [...recommendedResources, ...additionalResources]
    }

    const recommendations = recommendedResources.map((r) => ({
      id: r.id,
      title: r.title,
      author: r.author,
      type: r.type,
      subject: r.subject,
      likeCount: r._count.interactions,
      matchPercentage: userSubjects.includes(r.subject) ? 95 : 75,
      reason: userSubjects.includes(r.subject)
        ? "Based on your interests"
        : "Popular in community",
    }))

    // Recent activity
    const recentActivity = interactions.slice(0, 5).map((i) => {
      let type = "view"
      if (i.rating === 1) type = "like"
      else if (i.rating === -1) type = "dislike"
      else if (i.saved) type = "save"

      return {
        type,
        resourceId: i.resourceId,
        resourceTitle: i.resource.title,
        resourceSubject: i.resource.subject,
        timestamp: i.updatedAt.toISOString(),
      }
    })

    // Trending resources this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const trending = await db.resource.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            interactions: {
              where: { rating: 1 },
            },
          },
        },
      },
      orderBy: { interactions: { _count: "desc" } },
    })

    // Time-based greeting
    const hour = new Date().getHours()
    let greeting = "Good evening"
    if (hour < 12) greeting = "Good morning"
    else if (hour < 18) greeting = "Good afternoon"

    // Get review stats
    const now = new Date()
    const reviewCardsDue = await db.reviewCard.count({
      where: {
        userId,
        due: { lte: now },
      },
    })

    const totalReviewCards = await db.reviewCard.count({
      where: { userId },
    })

    // Calculate retention rate from recent reviews
    const recentReviews = await db.reviewLog.findMany({
      where: {
        userId,
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

    const reviewsToday = recentReviews.filter(
      (r) => r.reviewedAt >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
    ).length

    return NextResponse.json({
      user: {
        name: user?.name?.split(" ")[0] || "Learner",
        image: user?.image,
      },
      greeting,
      stats: {
        views: totalViews,
        likes: totalLikes,
        saved: totalSaved,
        streak,
      },
      reviewStats: {
        dueToday: reviewCardsDue,
        totalCards: totalReviewCards,
        retentionRate,
        reviewedToday: reviewsToday,
      },
      continueLearning: recentViewed,
      recommendations,
      recentActivity,
      trending: trending.map((r) => ({
        id: r.id,
        title: r.title,
        subject: r.subject,
        likeCount: r._count.interactions,
      })),
      hasProfile: !!userProfile?.onboardingCompleted,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
