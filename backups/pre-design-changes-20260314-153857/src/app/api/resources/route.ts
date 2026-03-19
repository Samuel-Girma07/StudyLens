import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const type = searchParams.get("type")
    const subject = searchParams.get("subject")
    const sort = searchParams.get("sort") || "popular"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ]
    }
    
    if (type && type !== "all") {
      where.type = type
    }
    
    if (subject && subject !== "all") {
      where.subject = subject
    }

    // Build orderBy
    let orderBy: Record<string, unknown>[] = []
    switch (sort) {
      case "newest":
        orderBy = [{ createdAt: "desc" }]
        break
      case "rated":
        orderBy = [{ likeCount: "desc" }]
        break
      case "popular":
      default:
        orderBy = [{ viewCount: "desc" }, { likeCount: "desc" }]
    }

    // Get current user if logged in
    const user = await getCurrentUser()
    
    // Fetch resources
    const resources = await db.resource.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    })

    // Get total count
    const total = await db.resource.count({ where })

    // If user is logged in, get their interactions
    let userInteractions: Record<string, { rating: number | null; saved: boolean }> = {}
    if (user) {
      const interactions = await db.userInteraction.findMany({
        where: {
          userId: user.id,
          resourceId: { in: resources.map(r => r.id) },
        },
      })
      interactions.forEach(i => {
        userInteractions[i.resourceId] = {
          rating: i.rating,
          saved: i.saved,
        }
      })
    }

    // Combine resources with user interactions
    const resourcesWithInteractions = resources.map(resource => ({
      ...resource,
      tags: JSON.parse(resource.tags),
      userInteraction: userInteractions[resource.id] || null,
    }))

    return NextResponse.json({
      resources: resourcesWithInteractions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}
