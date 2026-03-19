import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// ============================================
// GET /api/review/history - Fetch review history
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get review logs with resource info
    const logs = await db.reviewLog.findMany({
      where: {
        userId: user.id,
      },
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            author: true,
            type: true,
            subject: true,
            thumbnail: true,
          },
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await db.reviewLog.count({
      where: { userId: user.id },
    })

    // Calculate stats by rating
    const ratingStats = await db.reviewLog.groupBy({
      by: ["rating"],
      where: { userId: user.id },
      _count: true,
    })

    const ratingCounts = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    }

    ratingStats.forEach((stat) => {
      switch (stat.rating) {
        case 1:
          ratingCounts.again = stat._count
          break
        case 2:
          ratingCounts.hard = stat._count
          break
        case 3:
          ratingCounts.good = stat._count
          break
        case 4:
          ratingCounts.easy = stat._count
          break
      }
    })

    // Format logs for response
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      rating: log.rating,
      reviewedAt: log.reviewedAt,
      state: log.state,
      elapsedDays: log.elapsedDays,
      scheduledDays: log.scheduledDays,
      resource: {
        id: log.resource.id,
        title: log.resource.title,
        author: log.resource.author,
        type: log.resource.type,
        subject: log.resource.subject,
        thumbnail: log.resource.thumbnail,
      },
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      ratingCounts,
    })
  } catch (error) {
    console.error("Error fetching review history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
