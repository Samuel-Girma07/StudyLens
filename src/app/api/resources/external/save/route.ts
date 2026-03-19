import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { createNewReviewCard } from "@/lib/fsrs"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resource = await request.json()
    const now = new Date()

    // Ensure the external resource exists in our database
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
        }
      })
    }

    // Check for existing interaction
    const existingInteraction = await db.userInteraction.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId: resource.id } }
    })

    if (existingInteraction) {
      await db.userInteraction.update({
        where: { id: existingInteraction.id },
        data: { saved: true, savedAt: now }
      })
    } else {
      await db.userInteraction.create({
        data: { userId: user.id, resourceId: resource.id, saved: true, savedAt: now }
      })
    }

    // FSRS Review Card
    const existingReviewCard = await db.reviewCard.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId: resource.id } }
    })

    if (existingReviewCard) {
      await db.reviewCard.update({
        where: { id: existingReviewCard.id },
        data: { due: now }
      })
    } else {
      const newCard = createNewReviewCard(now)
      await db.reviewCard.create({
        data: {
          userId: user.id,
          resourceId: resource.id,
          due: newCard.due,
          stability: newCard.stability,
          difficulty: newCard.difficulty,
          elapsedDays: newCard.elapsedDays,
          scheduledDays: newCard.scheduledDays,
          learningSteps: newCard.learningSteps,
          reps: newCard.reps,
          lapses: newCard.lapses,
          state: newCard.state,
          lastReview: null,
        }
      })
    }

    return NextResponse.json({ success: true, resource: dbResource })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // We expect the frontend to pass the ID in the body for external DELETE
    // since we can't easily pass it in the URL if the route is just /external/save
    const { id } = await request.json()

    const existingInteraction = await db.userInteraction.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId: id } }
    })

    if (existingInteraction) {
      await db.userInteraction.update({
        where: { id: existingInteraction.id },
        data: { saved: false, savedAt: null }
      })
    }

    await db.reviewCard.deleteMany({
      where: { userId: user.id, resourceId: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
