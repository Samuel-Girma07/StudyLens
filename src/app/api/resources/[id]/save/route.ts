import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { createNewReviewCard } from "@/lib/fsrs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const now = new Date()

    // Check if resource exists
    const resource = await db.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Check for existing interaction
    const existingInteraction = await db.userInteraction.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId: id,
        },
      },
    })

    if (existingInteraction) {
      // Update to saved
      await db.userInteraction.update({
        where: { id: existingInteraction.id },
        data: {
          saved: true,
          savedAt: now,
        },
      })
    } else {
      // Create new interaction
      await db.userInteraction.create({
        data: {
          userId: user.id,
          resourceId: id,
          saved: true,
          savedAt: now,
        },
      })
    }

    // Create or restore ReviewCard for spaced repetition
    const existingReviewCard = await db.reviewCard.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId: id,
        },
      },
    })

    if (existingReviewCard) {
      // Restore the card (it might have been "deleted" by setting state to relearning)
      // Just update due date to now so it appears for review
      await db.reviewCard.update({
        where: { id: existingReviewCard.id },
        data: {
          due: now,
        },
      })
    } else {
      // Create new review card with FSRS defaults
      const newCard = createNewReviewCard(now)
      
      await db.reviewCard.create({
        data: {
          userId: user.id,
          resourceId: id,
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
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving resource:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Find and update the interaction
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
        data: {
          saved: false,
          savedAt: null,
        },
      })
    }

    // Delete the review card (user no longer wants to review this)
    await db.reviewCard.deleteMany({
      where: {
        userId: user.id,
        resourceId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsaving resource:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
