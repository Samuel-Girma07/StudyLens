import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    })

    // Get interaction stats
    const interactions = await db.userInteraction.findMany({
      where: { userId: user.id },
    })

    const likedCount = interactions.filter(i => i.rating === 1).length
    const dislikedCount = interactions.filter(i => i.rating === -1).length
    const savedCount = interactions.filter(i => i.saved).length
    const viewedCount = interactions.filter(i => i.viewed).length

    // Get subject interactions
    const ratedInteractions = await db.userInteraction.findMany({
      where: { userId: user.id, rating: { not: null } },
      include: { resource: true },
      take: 50,
    })

    const subjectCounts: Record<string, number> = {}
    ratedInteractions.forEach((i) => {
      if (i.resource?.subject) {
        subjectCounts[i.resource.subject] = (subjectCounts[i.resource.subject] || 0) + 1
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      profile: profile ? {
        subjects: JSON.parse(profile.subjects),
        formats: JSON.parse(profile.formats),
        experienceLevel: profile.experienceLevel,
        timeCommitment: profile.timeCommitment,
        onboardingCompleted: profile.onboardingCompleted,
      } : null,
      stats: {
        views: viewedCount,
        likes: likedCount,
        dislikes: dislikedCount,
        saved: savedCount,
        subjectInteractions: subjectCounts,
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
