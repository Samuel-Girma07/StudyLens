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

    const { id } = await params

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
          savedAt: new Date(),
        },
      })
    } else {
      // Create new interaction
      await db.userInteraction.create({
        data: {
          userId: user.id,
          resourceId: id,
          saved: true,
          savedAt: new Date(),
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsaving resource:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
