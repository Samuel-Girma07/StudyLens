import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

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

    // Subject distribution from interactions
    const subjectCounts: Record<string, number> = {}
    interactions.forEach((i) => {
      if (i.resource?.subject) {
        subjectCounts[i.resource.subject] = (subjectCounts[i.resource.subject] || 0) + 1
      }
    })

    // Type distribution from interactions
    const typeCounts: Record<string, number> = {}
    interactions.forEach((i) => {
      if (i.resource?.type) {
        typeCounts[i.resource.type] = (typeCounts[i.resource.type] || 0) + 1
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

    // Calculate learning streak (simplified - days with activity)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    const checkDate = new Date(today)
    
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(checkDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const hasActivity = interactions.some((interaction) => {
        const date = new Date(interaction.updatedAt)
        return date >= dayStart && date <= dayEnd
      })
      
      if (hasActivity) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // If no activity today, check from yesterday
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

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

    // AI usage stats - will be implemented when AI features are added
    // For now, return zeros to avoid breaking the frontend
    const aiStats = {
      summaries: 0,
      flashcards: 0,
      quizzes: 0,
      notes: 0,
      explanations: 0,
      total: 0,
    }

    const chatSessions = 0

    return NextResponse.json({
      stats: {
        totalViews,
        totalLikes,
        totalDislikes,
        totalSaved,
        streak,
      },
      subjectDistribution: subjectCounts,
      typeDistribution: typeCounts,
      preferredSubjects,
      preferredFormats,
      likedSubjectCounts,
      experienceLevel,
      timeCommitment,
      hasCompletedOnboarding,
      recentResources,
      aiStats,
      chatSessions,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
