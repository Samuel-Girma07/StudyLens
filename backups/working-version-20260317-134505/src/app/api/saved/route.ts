import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Get saved resources
    const savedInteractions = await db.userInteraction.findMany({
      where: {
        userId: user.id,
        saved: true,
      },
      include: {
        resource: true,
      },
      orderBy: {
        savedAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await db.userInteraction.count({
      where: {
        userId: user.id,
        saved: true,
      },
    })

    // Get all user interactions for these resources (for ratings)
    const resourceIds = savedInteractions.map(i => i.resourceId)

    // Only query if there are resource IDs (Prisma throws error for { in: [] })
    const allInteractions = resourceIds.length > 0
      ? await db.userInteraction.findMany({
          where: {
            userId: user.id,
            resourceId: { in: resourceIds },
          },
        })
      : []

    const interactionMap = new Map(allInteractions.map(i => [i.resourceId, i]))

    // Format response
    const resources = savedInteractions.map((interaction) => ({
      id: interaction.resource.id,
      title: interaction.resource.title,
      description: interaction.resource.description,
      author: interaction.resource.author,
      type: interaction.resource.type,
      subject: interaction.resource.subject,
      thumbnail: interaction.resource.thumbnail,
      difficulty: interaction.resource.difficulty,
      tags: JSON.parse(interaction.resource.tags),
      likeCount: interaction.resource.likeCount,
      viewCount: interaction.resource.viewCount,
      savedAt: interaction.savedAt,
      userInteraction: {
        rating: interactionMap.get(interaction.resourceId)?.rating || null,
        saved: true,
      },
    }))

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching saved resources:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
