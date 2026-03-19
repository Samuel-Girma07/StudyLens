import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { resource, rating } = await request.json()
    if (rating !== 1 && rating !== -1 && rating !== null) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    // Ensure resource exists
    let dbResource = await db.resource.findUnique({ where: { id: resource.id } })
    if (!dbResource) {
      dbResource = await db.resource.create({
        data: {
          id: resource.id,
          title: resource.title,
          description: resource.description || "",
          type: resource.type,
          subject: resource.subject,
          url: resource.url || "",
          author: resource.author || "Unknown",
          thumbnail: resource.thumbnail || null,
          difficulty: resource.difficulty || "beginner",
          tags: JSON.stringify(resource.tags || []),
          likeCount: 0,
        }
      })
    }

    const existingInteraction = await db.userInteraction.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId: resource.id } }
    })

    if (existingInteraction) {
      if (existingInteraction.rating === rating) {
        await db.userInteraction.update({
          where: { id: existingInteraction.id },
          data: { rating: null }
        })
        if (rating === 1) {
          await db.resource.update({
            where: { id: resource.id },
            data: { likeCount: Math.max(0, dbResource.likeCount - 1) }
          })
        }
      } else {
        const oldRating = existingInteraction.rating
        await db.userInteraction.update({
          where: { id: existingInteraction.id },
          data: { rating }
        })
        let change = 0
        if (oldRating === 1) change -= 1
        if (rating === 1) change += 1
        if (change !== 0) {
          await db.resource.update({
            where: { id: resource.id },
            data: { likeCount: Math.max(0, dbResource.likeCount + change) }
          })
        }
      }
    } else {
      await db.userInteraction.create({
        data: { userId: user.id, resourceId: resource.id, rating }
      })
      if (rating === 1) {
        await db.resource.update({
          where: { id: resource.id },
          data: { likeCount: dbResource.likeCount + 1 }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to rate resource" }, { status: 500 })
  }
}
