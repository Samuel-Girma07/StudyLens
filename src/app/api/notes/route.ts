import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { Prisma } from "@prisma/client"

// ============================================
// GET - List all notes for the user
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get("resourceId")
    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const pinned = searchParams.get("pinned")

    // Build filter conditions
    const where: Prisma.NoteWhereInput = {
      userId: user.id,
    }

    if (resourceId) {
      where.resourceId = resourceId
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    if (tag) {
      where.tags = { contains: tag }
    }

    if (pinned === "true") {
      where.isPinned = true
    }

    const notes = await db.note.findMany({
      where,
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
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      take: 50,
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error in notes GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// POST - Create a new note
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, resourceId, tags, color, isPinned } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Validate resource exists if provided
    if (resourceId) {
      const resource = await db.resource.findUnique({
        where: { id: resourceId },
        select: { id: true },
      })
      if (!resource) {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 })
      }
    }

    // Parse and validate tags
    let tagsJson = "[]"
    if (tags) {
      if (Array.isArray(tags)) {
        tagsJson = JSON.stringify(tags)
      } else if (typeof tags === "string") {
        tagsJson = tags
      }
    }

    // Validate color
    const validColors = ["cyan", "lime", "orange", "purple", "pink", "white"]
    const noteColor = color && validColors.includes(color) ? color : null

    const note = await db.note.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        resourceId: resourceId || null,
        tags: tagsJson,
        color: noteColor,
        isPinned: isPinned === true,
      },
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

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error("Error in notes POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
