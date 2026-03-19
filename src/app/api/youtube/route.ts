import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// YouTube API key from environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeSearchResult {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    thumbnails: {
      medium: {
        url: string
      }
      high: {
        url: string
      }
    }
    channelTitle: string
    publishedAt: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const maxResults = parseInt(searchParams.get("maxResults") || "6")

    if (!q) {
      return NextResponse.json({ videos: [] })
    }

    // Check if API key is configured
    if (!YOUTUBE_API_KEY) {
      console.error("YOUTUBE_API_KEY is not configured in environment variables")
      return NextResponse.json({ videos: [] })
    }

    // Check cache first
    const cacheKey = `youtube:${q}:${maxResults}`
    const cached = await db.youTubeCache.findUnique({
      where: { query: cacheKey },
    })

    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json({ videos: JSON.parse(cached.results) })
    }

    // Search YouTube
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
    searchUrl.searchParams.set("part", "snippet")
    searchUrl.searchParams.set("q", q + " tutorial education")
    searchUrl.searchParams.set("type", "video")
    searchUrl.searchParams.set("maxResults", String(maxResults))
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY)

    const response = await fetch(searchUrl.toString())
    
    if (!response.ok) {
      console.error("YouTube API error:", response.status)
      // Return empty if API fails, don't break the page
      return NextResponse.json({ videos: [] })
    }

    const data = await response.json()
    
    const videos = (data.items as YouTubeSearchResult[]).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }))

    // Cache the results for 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await db.youTubeCache.upsert({
      where: { query: cacheKey },
      update: {
        results: JSON.stringify(videos),
        expiresAt,
      },
      create: {
        query: cacheKey,
        results: JSON.stringify(videos),
        expiresAt,
      },
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching YouTube videos:", error)
    return NextResponse.json({ videos: [] })
  }
}
