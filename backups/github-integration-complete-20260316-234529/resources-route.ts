import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { 
  fetchOpenLibraryBooks, 
  fetchWikipediaArticles, 
  fetchArxivPapers,
  fetchGutenbergBooks,
  fetchHackerNewsStories,
  fetchDevToArticles,
  fetchGitHubRepos,
  isExternalResource 
} from "@/lib/external-apis"

// External API types (not stored in database)
const externalTypes = ["youtube", "openlibrary", "wikipedia", "arxiv", "gutenberg", "hackernews", "devto", "github"]

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeSearchResult {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    description: string
    thumbnails: {
      medium: { url: string }
      high: { url: string }
    }
    channelTitle: string
    publishedAt: string
  }
}

// Fetch YouTube videos based on search query
async function fetchYouTubeVideos(query: string, subject: string | null, maxResults: number = 12) {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY not configured")
    return []
  }

  try {
    // Build search query with subject context
    let searchQuery = query || "learning education"
    
    if (subject && subject !== "all") {
      const subjectContext: Record<string, string> = {
        programming: "programming coding tutorial",
        mathematics: "mathematics math tutorial",
        science: "science education tutorial",
        languages: "language learning tutorial",
        history: "history education documentary",
        business: "business entrepreneurship tutorial",
      }
      searchQuery = query 
        ? `${query} ${subjectContext[subject]} education tutorial`.trim()
        : `${subjectContext[subject]} education`.trim()
    } else if (!query) {
      searchQuery = "education learning tutorial"
    } else {
      searchQuery = `${query} education tutorial`.trim()
    }

    // Check cache first
    const cacheKey = `youtube:${searchQuery}:${maxResults}`
    const cached = await db.youTubeCache.findUnique({
      where: { query: cacheKey },
    })

    if (cached && cached.expiresAt > new Date()) {
      return JSON.parse(cached.results)
    }

    // Search YouTube with timeout
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
    searchUrl.searchParams.set("part", "snippet")
    searchUrl.searchParams.set("q", searchQuery)
    searchUrl.searchParams.set("type", "video")
    searchUrl.searchParams.set("maxResults", String(maxResults))
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY)

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(searchUrl.toString(), {
        signal: controller.signal
      })
      
      if (!response.ok) {
        console.error("YouTube API error:", response.status)
        return []
      }

      const data = await response.json()
    
      const videos = (data.items as YouTubeSearchResult[]).map((item) => ({
        id: `yt-${item.id.videoId}`,
        title: item.snippet.title,
        description: item.snippet.description,
        author: item.snippet.channelTitle,
        type: "youtube",
        subject: subject || "programming",
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
        difficulty: "beginner",
        tags: [],
        likeCount: 0,
        viewCount: 0,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        videoId: item.id.videoId,
        userInteraction: null,
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

      return videos
    } catch (fetchError) {
      console.error("Error fetching YouTube videos:", fetchError)
      return []
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.error("Error in YouTube fetch:", error)
    return []
  }
}

// ============================================
// SMART RESOURCE MERGING - Fair Distribution
// ============================================

/**
 * Interleaves resources from multiple sources to ensure fair distribution.
 * Takes one item from each source in round-robin fashion until all are exhausted.
 * This ensures users see diverse results from all sources on the first page.
 */
function interleaveResources(
  dbResources: unknown[],
  sourceArrays: { name: string; items: unknown[] }[]
): unknown[] {
  const result: unknown[] = []
  const maxLength = Math.max(dbResources.length, ...sourceArrays.map(s => s.items.length))
  
  // First, add database resources (highest priority - curated content)
  result.push(...dbResources)
  
  // Then interleave external sources in round-robin fashion
  for (let i = 0; i < maxLength; i++) {
    for (const source of sourceArrays) {
      if (source.items[i]) {
        result.push(source.items[i])
      }
    }
  }
  
  return result
}

// Fetch all external resources in parallel
async function fetchAllExternalResources(query: string, subject: string | null, maxPerApi: number = 3) {
  const [
    openLibraryBooks, 
    wikipediaArticles, 
    arxivPapers, 
    gutenbergBooks,
    hackerNewsStories,
    devToArticles,
    youtubeVideos,
    githubRepos
  ] = await Promise.all([
    fetchOpenLibraryBooks(query, maxPerApi),
    fetchWikipediaArticles(query, maxPerApi),
    fetchArxivPapers(query, maxPerApi),
    fetchGutenbergBooks(query, maxPerApi),
    fetchHackerNewsStories(query, maxPerApi),
    fetchDevToArticles(query, maxPerApi),
    fetchYouTubeVideos(query, subject, maxPerApi),
    fetchGitHubRepos(query, maxPerApi),
  ])
  
  return {
    openLibraryBooks,
    wikipediaArticles,
    arxivPapers,
    gutenbergBooks,
    hackerNewsStories,
    devToArticles,
    youtubeVideos,
    githubRepos,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const subject = searchParams.get("subject")
    const sort = searchParams.get("sort") || "popular"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get current user if logged in
    const user = await getCurrentUser()

    // ============================================
    // HANDLE EXTERNAL API-ONLY REQUESTS
    // ============================================
    
    if (type === "youtube") {
      const youtubeVideos = await fetchYouTubeVideos(q, subject, limit)
      return NextResponse.json({
        resources: youtubeVideos,
        pagination: { page, limit, total: youtubeVideos.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "openlibrary") {
      const books = await fetchOpenLibraryBooks(q, limit)
      return NextResponse.json({
        resources: books,
        pagination: { page, limit, total: books.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "wikipedia") {
      const articles = await fetchWikipediaArticles(q, limit)
      return NextResponse.json({
        resources: articles,
        pagination: { page, limit, total: articles.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "arxiv") {
      const papers = await fetchArxivPapers(q, limit)
      return NextResponse.json({
        resources: papers,
        pagination: { page, limit, total: papers.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "gutenberg") {
      const books = await fetchGutenbergBooks(q, limit)
      return NextResponse.json({
        resources: books,
        pagination: { page, limit, total: books.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "hackernews") {
      const stories = await fetchHackerNewsStories(q, limit)
      return NextResponse.json({
        resources: stories,
        pagination: { page, limit, total: stories.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "devto") {
      const articles = await fetchDevToArticles(q, limit)
      return NextResponse.json({
        resources: articles,
        pagination: { page, limit, total: articles.length, totalPages: 1 },
        hasMore: false,
      })
    }
    
    if (type === "github") {
      const repos = await fetchGitHubRepos(q, limit)
      return NextResponse.json({
        resources: repos,
        pagination: { page, limit, total: repos.length, totalPages: 1 },
        hasMore: false,
      })
    }

    // ============================================
    // DATABASE RESOURCES
    // ============================================
    
    // Build where clause for database resources
    const where: Record<string, unknown> = {}
    
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { author: { contains: q } },
      ]
    }
    
    // Only filter by type if it's a database type
    if (type !== "all" && !externalTypes.includes(type)) {
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
    
    // Fetch database resources
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
    if (user && resources.length > 0) {
      const resourceIds = resources.map(r => r.id)
      const interactions = await db.userInteraction.findMany({
        where: {
          userId: user.id,
          resourceId: { in: resourceIds },
        },
      })
      interactions.forEach(i => {
        userInteractions[i.resourceId] = {
          rating: i.rating,
          saved: i.saved,
        }
      })
    }

    // Combine database resources with user interactions
    const dbResources = resources.map(resource => ({
      ...resource,
      tags: JSON.parse(resource.tags),
      userInteraction: userInteractions[resource.id] || null,
    }))

    // ============================================
    // FETCH EXTERNAL RESOURCES WHEN SEARCHING
    // ============================================
    
    if (type === "all" && q) {
      // Fetch all external resources in parallel (3 per source for good distribution)
      const externalResources = await fetchAllExternalResources(q, subject, 3)
      
      // If no database results but we have a subject filter, try to get related resources
      let relatedResources: typeof dbResources = []
      if (dbResources.length === 0 && subject && subject !== "all") {
        const related = await db.resource.findMany({
          where: { subject },
          orderBy: [{ viewCount: "desc" }, { likeCount: "desc" }],
          take: 3,
        })
        relatedResources = related.map(r => ({
          ...r,
          tags: JSON.parse(r.tags),
          userInteraction: userInteractions[r.id] || null,
        }))
      }
      
      // Organize external sources for fair interleaving
      // Order: Most relevant/popular sources first for round-robin
      const externalSources = [
        { name: 'youtube', items: externalResources.youtubeVideos },
        { name: 'github', items: externalResources.githubRepos },
        { name: 'devto', items: externalResources.devToArticles },
        { name: 'hackernews', items: externalResources.hackerNewsStories },
        { name: 'openlibrary', items: externalResources.openLibraryBooks },
        { name: 'wikipedia', items: externalResources.wikipediaArticles },
        { name: 'arxiv', items: externalResources.arxivPapers },
        { name: 'gutenberg', items: externalResources.gutenbergBooks },
      ]
      
      // Use smart interleaving for fair distribution
      const mergedResources = interleaveResources(
        [...dbResources, ...relatedResources],
        externalSources
      )
      
      const externalCount = 
        externalResources.openLibraryBooks.length + 
        externalResources.wikipediaArticles.length + 
        externalResources.arxivPapers.length +
        externalResources.gutenbergBooks.length +
        externalResources.hackerNewsStories.length +
        externalResources.devToArticles.length +
        externalResources.youtubeVideos.length +
        externalResources.githubRepos.length
      
      return NextResponse.json({
        resources: mergedResources.slice(0, limit),
        pagination: {
          page,
          limit,
          total: total + externalCount + relatedResources.length,
          totalPages: Math.ceil((total + externalCount + relatedResources.length) / limit),
        },
        hasMore: skip + limit < total,
      })
    }

    // Return database resources only (when no search query or specific type filter)
    return NextResponse.json({
      resources: dbResources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}
