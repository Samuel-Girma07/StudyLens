import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    // Fetch the resource
    const resource = await db.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Increment view count
    await db.resource.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // If user is logged in, record the view
    if (user) {
      const existingInteraction = await db.userInteraction.findUnique({
        where: {
          userId_resourceId: {
            userId: user.id,
            resourceId: id,
          },
        },
      })

      if (existingInteraction) {
        await db.userInteraction.update({
          where: { id: existingInteraction.id },
          data: { viewed: true },
        })
      } else {
        await db.userInteraction.create({
          data: {
            userId: user.id,
            resourceId: id,
            viewed: true,
          },
        })
      }
    }

    // Get user interaction if logged in
    let userInteraction: { rating: number | null; saved: boolean; viewed: boolean } | null = null
    if (user) {
      const interaction = await db.userInteraction.findUnique({
        where: {
          userId_resourceId: {
            userId: user.id,
            resourceId: id,
          },
        },
      })
      if (interaction) {
        userInteraction = {
          rating: interaction.rating,
          saved: interaction.saved,
          viewed: interaction.viewed,
        }
      }
    }

    // Get similar resources (same subject or type)
    const similarResources = await db.resource.findMany({
      where: {
        OR: [
          { subject: resource.subject },
          { type: resource.type },
        ],
        id: { not: id },
      },
      take: 6,
      orderBy: { likeCount: "desc" },
    })

    return NextResponse.json({
      resource: {
        ...resource,
        tags: JSON.parse(resource.tags),
        userInteraction,
      },
      similarResources: similarResources.map(r => ({
        ...r,
        tags: JSON.parse(r.tags),
      })),
    })
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
