import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { Prisma } from "@prisma/client"

// ============================================
// GET - Get a single note by ID
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const note = await db.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            subject: true,
            type: true,
            author: true,
            url: true,
          },
        },
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error in note GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// PUT - Update a note
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, resourceId, tags, color, isPinned, summary } = body

    // Check note exists and belongs to user
    const existingNote = await db.note.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Build update data
    const updateData: Prisma.NoteUpdateInput = {}

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 })
      }
      updateData.title = title.trim()
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 })
      }
      updateData.content = content.trim()
    }

    if (resourceId !== undefined) {
      // Validate resource exists if provided
      if (resourceId) {
        const resource = await db.resource.findUnique({
          where: { id: resourceId },
          select: { id: true },
        })
        if (!resource) {
          return NextResponse.json({ error: "Resource not found" }, { status: 404 })
        }
        updateData.resource = { connect: { id: resourceId } }
      } else {
        updateData.resource = { disconnect: true }
      }
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updateData.tags = JSON.stringify(tags)
      } else if (typeof tags === "string") {
        updateData.tags = tags
      }
    }

    if (color !== undefined) {
      const validColors = ["cyan", "lime", "orange", "purple", "pink", "white"]
      updateData.color = color && validColors.includes(color) ? color : null
    }

    if (isPinned !== undefined) {
      updateData.isPinned = isPinned === true
    }

    if (summary !== undefined) {
      updateData.summary = typeof summary === "string" ? summary : null
    }

    const note = await db.note.update({
      where: { id },
      data: updateData,
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            subject: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error in note PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// DELETE - Delete a note
// ============================================
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

    // Check note exists and belongs to user
    const note = await db.note.findFirst({
      where: { id, userId: user.id },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await db.note.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in note DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
