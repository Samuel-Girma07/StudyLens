import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: resourceId } = await params
    const body = await request.json()
    const { rating } = body

    if (rating !== 1 && rating !== -1) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    // Check if resource exists
    const resource = await db.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Check for existing interaction
    const existingInteraction = await db.userInteraction.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId,
        },
      },
    })

    if (existingInteraction) {
      // If same rating, remove it (toggle off)
      if (existingInteraction.rating === rating) {
        await db.userInteraction.update({
          where: { id: existingInteraction.id },
          data: { rating: null },
        })
        
        // Update resource like count
        if (rating === 1) {
          await db.resource.update({
            where: { id: resourceId },
            data: { likeCount: Math.max(0, resource.likeCount - 1) },
          })
        }
      } else {
        // Update rating
        const oldRating = existingInteraction.rating
        await db.userInteraction.update({
          where: { id: existingInteraction.id },
          data: { rating },
        })
        
        // Update resource like count
        let likeCountChange = 0
        if (oldRating === 1) likeCountChange -= 1
        if (rating === 1) likeCountChange += 1
        
        if (likeCountChange !== 0) {
          await db.resource.update({
            where: { id: resourceId },
            data: { likeCount: Math.max(0, resource.likeCount + likeCountChange) },
          })
        }
      }
    } else {
      // Create new interaction
      await db.userInteraction.create({
        data: {
          userId: user.id,
          resourceId,
          rating,
        },
      })
      
      // Update resource like count
      if (rating === 1) {
        await db.resource.update({
          where: { id: resourceId },
          data: { likeCount: resource.likeCount + 1 },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error rating resource:", error)
    return NextResponse.json(
      { error: "Failed to rate resource" },
      { status: 500 }
    )
  }
}
