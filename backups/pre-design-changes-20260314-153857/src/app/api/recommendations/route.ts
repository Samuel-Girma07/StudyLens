import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// Recommendation reasons based on match type
const getRecommendationReason = (
  matchType: "subject" | "format" | "similar" | "popular" | "default",
  metadata?: { subject?: string; format?: string }
): string => {
  switch (matchType) {
    case "subject":
      return `Matches your interest in ${metadata?.subject || "this subject"}`
    case "format":
      return `Perfect for your preferred ${metadata?.format || "learning format"}`
    case "similar":
      return "Similar to resources you've liked"
    case "popular":
      return "Popular with other learners"
    default:
      return "Recommended for you"
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    })

    // Parse preferences or use defaults
    const preferredSubjects = profile ? JSON.parse(profile.subjects) : []
    const preferredFormats = profile ? JSON.parse(profile.formats) : []
    const experienceLevel = profile?.experienceLevel || "beginner"

    // Get user's past interactions to understand preferences
    const userInteractions = await db.userInteraction.findMany({
      where: {
        userId: user.id,
        rating: { not: null },
      },
      include: { resource: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    })

    // Get IDs of resources user has already interacted with
    const interactedIds = userInteractions.map(i => i.resourceId)

    // Calculate user's preferred subjects from interactions
    const likedResources = userInteractions.filter(i => i.rating === 1)
    const dislikedResources = userInteractions.filter(i => i.rating === -1)

    // Build recommendation query
    const recommendations: Array<{
      resource: any
      score: number
      matchType: "subject" | "format" | "similar" | "popular" | "default"
      metadata?: { subject?: string; format?: string }
    }> = []

    // 1. Resources matching user's preferred subjects
    if (preferredSubjects.length > 0) {
      const subjectMatches = await db.resource.findMany({
        where: {
          subject: { in: preferredSubjects },
          id: { notIn: interactedIds },
        },
        take: 10,
        orderBy: { likeCount: "desc" },
      })

      for (const resource of subjectMatches) {
        recommendations.push({
          resource,
          score: 10,
          matchType: "subject",
          metadata: { subject: resource.subject },
        })
      }
    }

    // 2. Resources matching user's preferred formats (mapped from types)
    if (preferredFormats.length > 0) {
      const formatToType: Record<string, string> = {
        books: "book",
        articles: "article",
        videos: "video",
      }

      const types = preferredFormats.map(f => formatToType[f]).filter(Boolean)

      if (types.length > 0) {
        const formatMatches = await db.resource.findMany({
          where: {
            type: { in: types },
            id: { notIn: [...interactedIds, ...recommendations.map(r => r.resource.id)] },
          },
          take: 10,
          orderBy: { likeCount: "desc" },
        })

        for (const resource of formatMatches) {
          recommendations.push({
            resource,
            score: 8,
            matchType: "format",
            metadata: { format: resource.type },
          })
        }
      }
    }

    // 3. Resources similar to what user liked (same subject/type combination)
    if (likedResources.length > 0) {
      const likedSubjects = [...new Set(likedResources.map(i => i.resource?.subject).filter(Boolean))]
      const likedTypes = [...new Set(likedResources.map(i => i.resource?.type).filter(Boolean))]

      if (likedSubjects.length > 0 && likedTypes.length > 0) {
        const similarMatches = await db.resource.findMany({
          where: {
            subject: { in: likedSubjects },
            type: { in: likedTypes },
            id: { notIn: [...interactedIds, ...recommendations.map(r => r.resource.id)] },
          },
          take: 8,
          orderBy: { likeCount: "desc" },
        })

        for (const resource of similarMatches) {
          recommendations.push({
            resource,
            score: 12,
            matchType: "similar",
          })
        }
      }
    }

    // 4. Fill with popular resources if not enough
    if (recommendations.length < 15) {
      const popularResources = await db.resource.findMany({
        where: {
          id: { notIn: [...interactedIds, ...recommendations.map(r => r.resource.id)] },
        },
        take: 15 - recommendations.length,
        orderBy: { likeCount: "desc" },
      })

      for (const resource of popularResources) {
        recommendations.push({
          resource,
          score: 5,
          matchType: "popular",
        })
      }
    }

    // Sort by score and take top 20
    recommendations.sort((a, b) => b.score - a.score)
    const topRecommendations = recommendations.slice(0, 20)

    // Get user interactions for these resources
    const resourceIds = topRecommendations.map(r => r.resource.id)
    const userRatings = await db.userInteraction.findMany({
      where: {
        userId: user.id,
        resourceId: { in: resourceIds },
      },
    })

    const ratingMap = new Map(userRatings.map(r => [r.resourceId, r]))

    // Format response
    const formattedResources = topRecommendations.map(({ resource, matchType, metadata }) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      author: resource.author,
      type: resource.type,
      subject: resource.subject,
      thumbnail: resource.thumbnail,
      difficulty: resource.difficulty,
      tags: JSON.parse(resource.tags),
      likeCount: resource.likeCount,
      viewCount: resource.viewCount,
      userInteraction: ratingMap.has(resource.id) ? {
        rating: ratingMap.get(resource.id)!.rating,
        saved: ratingMap.get(resource.id)!.saved,
      } : null,
      recommendationReason: getRecommendationReason(matchType, metadata),
    }))

    return NextResponse.json({
      resources: formattedResources,
      profileCompleted: profile?.onboardingCompleted || false,
    })
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
