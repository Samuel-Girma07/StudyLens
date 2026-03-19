import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subjects, formats, experienceLevel, timeCommitment } = body

    // Validate
    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: "At least one subject is required" }, { status: 400 })
    }

    if (!formats || formats.length === 0) {
      return NextResponse.json({ error: "At least one format is required" }, { status: 400 })
    }

    if (!experienceLevel) {
      return NextResponse.json({ error: "Experience level is required" }, { status: 400 })
    }

    // Update or create profile
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: user.id },
    })

    if (existingProfile) {
      await db.userProfile.update({
        where: { userId: user.id },
        data: {
          subjects: JSON.stringify(subjects),
          formats: JSON.stringify(formats),
          experienceLevel,
          timeCommitment: timeCommitment || "moderate",
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
      })
    } else {
      await db.userProfile.create({
        data: {
          userId: user.id,
          subjects: JSON.stringify(subjects),
          formats: JSON.stringify(formats),
          experienceLevel,
          timeCommitment: timeCommitment || "moderate",
          onboardingCompleted: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving onboarding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
