// ============================================
// EXTERNAL API UTILITIES
// Free APIs: Open Library, Wikipedia, ArXiv, Gutenberg, Hacker News, Dev.to
// No API keys required
// ============================================

import { db } from "@/lib/db"

// ============================================
// TYPES
// ============================================

export type ExternalResourceType = "openlibrary" | "wikipedia" | "arxiv" | "gutenberg" | "hackernews" | "devto" | "youtube" | "github"

export interface ExternalResource {
  id: string
  title: string
  description: string
  author: string
  type: ExternalResourceType
  subject: string
  thumbnail: string | null
  url: string
  difficulty: string
  tags: string[]
  likeCount: number
  viewCount: number
  userInteraction: null
}

// Subject mapping from external API categories to our subjects
const SUBJECT_MAPPING: Record<string, string> = {
  // Programming
  "programming": "programming",
  "computers": "programming",
  "software": "programming",
  "computer science": "programming",
  "web development": "programming",
  "cs": "programming",
  "coding": "programming",
  "developer": "programming",
  "javascript": "programming",
  "python": "programming",
  
  // Mathematics
  "mathematics": "mathematics",
  "math": "mathematics",
  "algebra": "mathematics",
  "calculus": "mathematics",
  "statistics": "mathematics",
  "stat": "mathematics",
  
  // Science
  "science": "science",
  "physics": "science",
  "chemistry": "science",
  "biology": "science",
  "q-bio": "science",
  
  // Languages
  "language": "languages",
  "linguistics": "languages",
  "foreign": "languages",
  "cl": "languages",
  
  // History
  "history": "history",
  "historical": "history",
  
  // Business
  "business": "business",
  "economics": "business",
  "finance": "business",
  "econ": "business",
  "q-fin": "business",
  "startup": "business",
  "entrepreneur": "business",
}

// Default subjects for each API when no mapping found
const DEFAULT_SUBJECTS: Record<string, string> = {
  openlibrary: "science",
  wikipedia: "science",
  arxiv: "science",
  gutenberg: "languages",
  hackernews: "programming",
  devto: "programming",
  youtube: "programming",
  github: "programming",
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapSubject(apiType: string, subjects: string[] = []): string {
  for (const subject of subjects) {
    const lowerSubject = subject.toLowerCase()
    for (const [key, value] of Object.entries(SUBJECT_MAPPING)) {
      if (lowerSubject.includes(key)) {
        return value
      }
    }
  }
  return DEFAULT_SUBJECTS[apiType] || "science"
}

async function fetchWithTimeout(url: string, timeoutMs: number = 8000, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: headers
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// ============================================
// OPEN LIBRARY API
// ============================================

interface OpenLibraryDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  subject?: string[]
  first_publish_year?: number
}

async function fetchOpenLibraryBooks(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  try {
    const searchUrl = new URL("https://openlibrary.org/search.json")
    searchUrl.searchParams.set("q", query)
    searchUrl.searchParams.set("limit", String(maxResults))
    searchUrl.searchParams.set("fields", "key,title,author_name,cover_i,subject,first_publish_year")
    
    const response = await fetchWithTimeout(searchUrl.toString())
    
    if (!response.ok) {
      console.error("Open Library API error:", response.status)
      return []
    }
    
    const data = await response.json()
    
    return (data.docs as OpenLibraryDoc[]).map((doc) => ({
      id: `ol-${doc.key.replace("/works/", "")}`,
      title: doc.title,
      description: doc.first_publish_year 
        ? `Free ebook from Open Library. First published in ${doc.first_publish_year}.`
        : "Free ebook from Open Library.",
      author: doc.author_name?.[0] || "Unknown Author",
      type: "openlibrary" as const,
      subject: mapSubject("openlibrary", doc.subject),
      thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      url: `https://openlibrary.org${doc.key}`,
      difficulty: "beginner",
      tags: doc.subject?.slice(0, 5) || [],
      likeCount: 0,
      viewCount: 0,
      userInteraction: null,
    }))
  } catch (error) {
    console.error("Error fetching Open Library books:", error)
    return []
  }
}

// ============================================
// WIKIPEDIA API
// ============================================

interface WikipediaSearchResult {
  pageid: number
  title: string
  snippet: string
}

async function fetchWikipediaArticles(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php")
    searchUrl.searchParams.set("action", "query")
    searchUrl.searchParams.set("list", "search")
    searchUrl.searchParams.set("srsearch", query)
    searchUrl.searchParams.set("format", "json")
    searchUrl.searchParams.set("srlimit", String(maxResults))
    searchUrl.searchParams.set("origin", "*")
    
    const response = await fetchWithTimeout(searchUrl.toString(), 8000, {
      "User-Agent": "StudyLens/1.0 (https://studylens.app; educational platform)"
    })
    
    if (!response.ok) {
      console.error("Wikipedia API error:", response.status)
      return []
    }
    
    const data = await response.json()
    
    return (data.query?.search as WikipediaSearchResult[] || []).map((result) => {
      const cleanSnippet = result.snippet
        .replace(/<span class="searchmatch">/g, "")
        .replace(/<\/span>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
      
      return {
        id: `wiki-${result.pageid}`,
        title: result.title,
        description: cleanSnippet.length > 200 ? cleanSnippet.slice(0, 200) + "..." : cleanSnippet,
        author: "Wikipedia",
        type: "wikipedia" as const,
        subject: mapSubject("wikipedia", [query]),
        thumbnail: null,
        url: `https://en.wikipedia.org/?curid=${result.pageid}`,
        difficulty: "beginner",
        tags: [],
        likeCount: 0,
        viewCount: 0,
        userInteraction: null,
      }
    })
  } catch (error) {
    console.error("Error fetching Wikipedia articles:", error)
    return []
  }
}

// ============================================
// ARXIV API
// ============================================

interface ArxivEntry {
  id: string
  title: string
  summary: string
  authors: string[]
  categories: string[]
}

function parseArxivXml(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = []
  const entryMatches = xml.split("<entry>")
  
  for (let i = 1; i < entryMatches.length; i++) {
    const entry = entryMatches[i]
    
    const idMatch = entry.match(/<id>(.*?)<\/id>/)
    const id = idMatch ? idMatch[1] : ""
    const paperIdMatch = id.match(/abs\/(\d+\.\d+)/)
    const paperId = paperIdMatch ? paperIdMatch[1] : ""
    
    const titleMatch = entry.match(/<title>(.*?)<\/title>/s)
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : ""
    
    const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/s)
    const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, " ").trim() : ""
    
    const authors: string[] = []
    const authorMatches = entry.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>/g)
    for (const match of authorMatches) {
      authors.push(match[1].trim())
    }
    
    const categories: string[] = []
    const categoryMatches = entry.matchAll(/<category term="([^"]+)"/g)
    for (const match of categoryMatches) {
      categories.push(match[1])
    }
    
    if (paperId && title) {
      entries.push({ id: paperId, title, summary, authors, categories })
    }
  }
  
  return entries
}

async function fetchArxivPapers(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  try {
    const searchUrl = new URL("http://export.arxiv.org/api/query")
    searchUrl.searchParams.set("search_query", `all:${query}`)
    searchUrl.searchParams.set("start", "0")
    searchUrl.searchParams.set("max_results", String(maxResults))
    
    const response = await fetchWithTimeout(searchUrl.toString(), 12000)
    
    if (!response.ok) {
      console.error("ArXiv API error:", response.status)
      return []
    }
    
    const xml = await response.text()
    const entries = parseArxivXml(xml)
    
    return entries.map((entry) => {
      const categoryPrefixes = entry.categories.map(c => c.split(".")[0])
      const subject = mapSubject("arxiv", categoryPrefixes)
      
      return {
        id: `arxiv-${entry.id}`,
        title: entry.title,
        description: entry.summary.length > 300 ? entry.summary.slice(0, 300) + "..." : entry.summary,
        author: entry.authors[0] || "Unknown Author",
        type: "arxiv" as const,
        subject,
        thumbnail: null,
        url: `https://arxiv.org/abs/${entry.id}`,
        difficulty: "advanced",
        tags: entry.categories.slice(0, 5),
        likeCount: 0,
        viewCount: 0,
        userInteraction: null,
      }
    })
  } catch (error) {
    console.error("Error fetching ArXiv papers:", error)
    return []
  }
}

// ============================================
// PROJECT GUTENBERG API (via Gutendex)
// ============================================

interface GutenbergBook {
  id: number
  title: string
  authors: { name: string }[]
  subjects: string[]
  formats: { "image/jpeg"?: string }
}

async function fetchGutenbergBooks(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  try {
    const searchUrl = new URL("https://gutendex.com/books")
    searchUrl.searchParams.set("search", query)
    
    const response = await fetchWithTimeout(searchUrl.toString(), 10000)
    
    if (!response.ok) {
      console.error("Gutenberg API error:", response.status)
      return []
    }
    
    const data = await response.json()
    
    return (data.results as GutenbergBook[]).slice(0, maxResults).map((book) => ({
      id: `gut-${book.id}`,
      title: book.title,
      description: "Free classic ebook from Project Gutenberg.",
      author: book.authors?.[0]?.name || "Unknown Author",
      type: "gutenberg" as const,
      subject: mapSubject("gutenberg", book.subjects),
      thumbnail: book.formats?.["image/jpeg"] || null,
      url: `https://www.gutenberg.org/ebooks/${book.id}`,
      difficulty: "beginner",
      tags: book.subjects?.slice(0, 5) || [],
      likeCount: 0,
      viewCount: 0,
      userInteraction: null,
    }))
  } catch (error) {
    console.error("Error fetching Gutenberg books:", error)
    return []
  }
}

// ============================================
// HACKER NEWS API (via Algolia)
// ============================================

interface HackerNewsHit {
  objectID: string
  title: string
  author: string
  url?: string
  points?: number
  num_comments?: number
  story_text?: string
}

async function fetchHackerNewsStories(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  try {
    const searchUrl = new URL("https://hn.algolia.com/api/v1/search")
    searchUrl.searchParams.set("query", query)
    searchUrl.searchParams.set("hitsPerPage", String(maxResults))
    searchUrl.searchParams.set("tags", "story")
    
    const response = await fetchWithTimeout(searchUrl.toString(), 10000)
    
    if (!response.ok) {
      console.error("Hacker News API error:", response.status)
      return []
    }
    
    const data = await response.json()
    
    return (data.hits as HackerNewsHit[]).map((hit) => ({
      id: `hn-${hit.objectID}`,
      title: hit.title,
      description: hit.story_text?.slice(0, 200) || `Discussion on Hacker News with ${hit.points || 0} points and ${hit.num_comments || 0} comments.`,
      author: hit.author || "Hacker News",
      type: "hackernews" as const,
      subject: mapSubject("hackernews", [query]),
      thumbnail: null,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      difficulty: "intermediate",
      tags: [],
      likeCount: hit.points || 0,
      viewCount: hit.num_comments || 0,
      userInteraction: null,
    }))
  } catch (error) {
    console.error("Error fetching Hacker News stories:", error)
    return []
  }
}

// ============================================
// DEV.TO API
// ============================================

interface DevToArticle {
  id: number
  title: string
  description: string
  user: { name: string }
  url: string
  cover_image?: string
  tag_list: string[]
  positive_reactions_count?: number
  comments_count?: number
}

async function fetchDevToArticles(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  try {
    const searchUrl = new URL("https://dev.to/api/articles")
    searchUrl.searchParams.set("search", query)
    searchUrl.searchParams.set("per_page", String(maxResults))
    
    const response = await fetchWithTimeout(searchUrl.toString(), 10000)
    
    if (!response.ok) {
      console.error("Dev.to API error:", response.status)
      return []
    }
    
    const data = await response.json()
    
    return (data as DevToArticle[]).map((article) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description?.slice(0, 200) || "Developer article from Dev.to",
      author: article.user?.name || "Dev.to Author",
      type: "devto" as const,
      subject: mapSubject("devto", article.tag_list),
      thumbnail: article.cover_image || null,
      url: article.url,
      difficulty: "intermediate",
      tags: article.tag_list?.slice(0, 5) || [],
      likeCount: article.positive_reactions_count || 0,
      viewCount: article.comments_count || 0,
      userInteraction: null,
    }))
  } catch (error) {
    console.error("Error fetching Dev.to articles:", error)
    return []
  }
}

// ============================================
// GITHUB API
// ============================================

interface GitHubRepo {
  id: number
  full_name: string
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  owner: {
    avatar_url: string
    login: string
  }
  topics: string[]
  created_at: string
  updated_at: string
}

// Language colors for GitHub repos
export const languageColors: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  R: "#198CE7",
  MATLAB: "#e16737",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
  Perl: "#39457E",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
}

async function fetchGitHubRepos(query: string, maxResults: number = 5): Promise<ExternalResource[]> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  
  try {
    const searchUrl = new URL("https://api.github.com/search/repositories")
    searchUrl.searchParams.set("q", `${query} in:name,description`)
    searchUrl.searchParams.set("sort", "stars")
    searchUrl.searchParams.set("order", "desc")
    searchUrl.searchParams.set("per_page", String(maxResults))
    
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
    }
    
    // Add auth header if token is available (higher rate limits)
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`
    }
    
    const response = await fetchWithTimeout(searchUrl.toString(), 10000, headers)
    
    if (!response.ok) {
      console.error("GitHub API error:", response.status)
      return []
    }
    
    const data = await response.json()
    
    return (data.items as GitHubRepo[]).map((repo) => ({
      id: `gh-${repo.id}`,
      title: repo.full_name,
      description: repo.description || `A ${repo.language || "code"} repository with ${repo.stargazers_count.toLocaleString()} stars.`,
      author: repo.owner.login,
      type: "github" as const,
      subject: mapSubject("github", [repo.language || "", ...repo.topics]),
      thumbnail: repo.owner.avatar_url,
      url: repo.html_url,
      difficulty: "intermediate",
      tags: [repo.language, ...repo.topics].filter(Boolean).slice(0, 5),
      likeCount: repo.stargazers_count,
      viewCount: repo.forks_count,
      userInteraction: null,
      // GitHub-specific fields for UI
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      language: repo.language,
      languageColor: repo.language ? languageColors[repo.language] : null,
    }))
  } catch (error) {
    console.error("Error fetching GitHub repos:", error)
    return []
  }
}

// ============================================
// MAIN EXPORT - FETCH ALL EXTERNAL RESOURCES
// ============================================

export interface FetchExternalOptions {
  query?: string
  subject?: string | null
  types?: string[]
  maxPerApi?: number
}

export async function fetchExternalResources(options: FetchExternalOptions): Promise<ExternalResource[]> {
  const { query, subject, types, maxPerApi = 3 } = options
  
  const searchQuery = query || subject || ""
  
  if (!searchQuery) {
    return []
  }
  
  const promises: Promise<ExternalResource[]>[] = []
  
  if (!types || types.includes("openlibrary") || types.includes("all")) {
    promises.push(fetchOpenLibraryBooks(searchQuery, maxPerApi))
  }
  if (!types || types.includes("wikipedia") || types.includes("all")) {
    promises.push(fetchWikipediaArticles(searchQuery, maxPerApi))
  }
  if (!types || types.includes("arxiv") || types.includes("all")) {
    promises.push(fetchArxivPapers(searchQuery, maxPerApi))
  }
  if (!types || types.includes("gutenberg") || types.includes("all")) {
    promises.push(fetchGutenbergBooks(searchQuery, maxPerApi))
  }
  if (!types || types.includes("hackernews") || types.includes("all")) {
    promises.push(fetchHackerNewsStories(searchQuery, maxPerApi))
  }
  if (!types || types.includes("devto") || types.includes("all")) {
    promises.push(fetchDevToArticles(searchQuery, maxPerApi))
  }
  if (!types || types.includes("github") || types.includes("all")) {
    promises.push(fetchGitHubRepos(searchQuery, maxPerApi))
  }
  
  const results = await Promise.all(promises)
  return results.flat()
}

// Export individual functions
export { 
  fetchOpenLibraryBooks, 
  fetchWikipediaArticles, 
  fetchArxivPapers,
  fetchGutenbergBooks,
  fetchHackerNewsStories,
  fetchDevToArticles,
  fetchGitHubRepos
}

// Type guard for external resources
export function isExternalResource(resource: { type: string }): boolean {
  return ["openlibrary", "wikipedia", "arxiv", "gutenberg", "hackernews", "devto", "youtube", "github"].includes(resource.type)
}
