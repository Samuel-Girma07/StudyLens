"use client"

import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { subjectNames, typeNames, subjectGradients, allSubjects, allTypes, externalTypes } from "@/lib/constants"
import { AppLayout } from "@/components/shared"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"

// ============================================
// BROWSE PAGE - GLOSSY BRUTALIST DESIGN
// ============================================
interface Resource {
  id: string
  title: string
  description: string
  author: string
  type: string
  subject: string
  thumbnail: string | null
  difficulty: string
  tags: string[]
  likeCount: number
  viewCount: number
  url?: string // For external resources
  videoId?: string // For YouTube videos
  channelTitle?: string // For YouTube videos
  // GitHub-specific fields
  forksCount?: number
  openIssuesCount?: number
  language?: string
  languageColor?: string
  userInteraction?: {
    rating: number | null
    saved: boolean
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Check if resource is from an external API (cannot be saved/rated)
const isExternalResource = (resource: Resource) => externalTypes.includes(resource.type)

// Get badge styling for each external type
const getExternalTypeBadge = (type: string) => {
  const badges: Record<string, { bg: string; text: string; icon: string }> = {
    youtube: { bg: "bg-red-500", text: "text-white", icon: "play_circle" },
    openlibrary: { bg: "bg-orange-500", text: "text-white", icon: "menu_book" },
    wikipedia: { bg: "bg-blue-500", text: "text-white", icon: "article" },
    arxiv: { bg: "bg-purple-500", text: "text-white", icon: "science" },
    gutenberg: { bg: "bg-emerald-500", text: "text-white", icon: "auto_stories" },
    hackernews: { bg: "bg-amber-500", text: "text-black", icon: "forum" },
    devto: { bg: "bg-slate-700", text: "text-white", icon: "code_blocks" },
    github: { bg: "bg-slate-800", text: "text-white", icon: "code" },
  }
  return badges[type] || { bg: "bg-slate-500", text: "text-white", icon: "link" }
}

// Get icon for resource type
const getResourceIcon = (type: string) => {
  const icons: Record<string, string> = {
    book: "menu_book",
    article: "article",
    video: "play_circle",
    youtube: "play_circle",
    openlibrary: "menu_book",
    wikipedia: "article",
    arxiv: "science",
    gutenberg: "auto_stories",
    hackernews: "forum",
    devto: "code_blocks",
    github: "code",
  }
  return icons[type] || "link"
}

// Get external link label
const getExternalLinkLabel = (type: string) => {
  const labels: Record<string, string> = {
    youtube: "Watch on YouTube",
    openlibrary: "Read on Open Library",
    wikipedia: "Read on Wikipedia",
    arxiv: "Read on ArXiv",
    gutenberg: "Read on Gutenberg",
    hackernews: "Discuss on HN",
    devto: "Read on Dev.to",
    github: "View on GitHub",
  }
  return labels[type] || "Open"
}

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [hasFilters, setHasFilters] = useState(false)

  const typeFilter = searchParams.get("type") || "all"
  const subjectFilter = searchParams.get("subject") || "all"
  const sortBy = searchParams.get("sort") || "popular"

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" || value === "popular") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }

  const setTypeFilter = (value: string) => updateParams("type", value)
  const setSubjectFilter = (value: string) => updateParams("subject", value)
  const setSortBy = (value: string) => updateParams("sort", value)

  const fetchResources = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (typeFilter !== "all") params.append("type", typeFilter)
      if (subjectFilter !== "all") params.append("subject", subjectFilter)
      params.append("sort", sortBy)
      params.append("page", String(page))
      params.append("limit", "12")

      const response = await fetch(`/api/resources?${params.toString()}`)
      const data = await response.json()
      setResources(data.resources || [])
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 })
    } catch (error) {
      console.error("Failed to fetch resources:", error)
      toast.error("Failed to load resources")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResources(1)
  }, [typeFilter, subjectFilter, sortBy, searchParams])

  useEffect(() => {
    setHasFilters(searchQuery !== "" || typeFilter !== "all" || subjectFilter !== "all")
  }, [searchQuery, typeFilter, subjectFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchResources(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push(pathname)
  }

  const handleRate = async (resourceId: string, rating: 1 | -1) => {
    // Don't allow rating external resources
    const resource = resources.find(r => r.id === resourceId)
    if (isExternalResource(resource!)) {
      toast.info(`${typeNames[resource!.type]} resources cannot be rated`)
      return
    }

    const currentResource = resources.find(r => r.id === resourceId)
    if (!currentResource) return

    const currentRating = currentResource.userInteraction?.rating

    setResources(prev => prev.map(r => {
      if (r.id !== resourceId) return r

      let newLikeCount = r.likeCount
      let newRating: number | null = rating

      if (currentRating === rating) {
        newRating = null
        if (rating === 1) newLikeCount = Math.max(0, r.likeCount - 1)
      } else if (currentRating === 1) {
        newLikeCount = Math.max(0, r.likeCount - 1)
      } else if (rating === 1) {
        newLikeCount = r.likeCount + 1
      }

      return {
        ...r,
        likeCount: newLikeCount,
        userInteraction: {
          ...r.userInteraction!,
          rating: newRating,
        },
      }
    }))

    try {
      const response = await fetch(`/api/resources/${resourceId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })
      if (response.ok) {
        toast.success(rating === 1 ? "Liked!" : "Disliked")
      } else {
        fetchResources(pagination.page)
        toast.error("Failed to rate resource")
      }
    } catch {
      fetchResources(pagination.page)
      toast.error("Failed to rate resource")
    }
  }

  const handleSave = async (resourceId: string, currentlySaved: boolean) => {
    // Don't allow saving external resources
    const resource = resources.find(r => r.id === resourceId)
    if (isExternalResource(resource!)) {
      toast.info(`${typeNames[resource!.type]} resources cannot be saved`)
      return
    }

    try {
      const method = currentlySaved ? "DELETE" : "POST"
      const response = await fetch(`/api/resources/${resourceId}/save`, { method })
      if (response.ok) {
        toast.success(currentlySaved ? "Removed from saved" : "Saved!")
        setResources(prev => prev.map(r =>
          r.id === resourceId
            ? { ...r, userInteraction: { ...r.userInteraction!, saved: !currentlySaved } }
            : r
        ))
      }
    } catch {
      toast.error("Failed to save resource")
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchResources(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle opening a resource
  const handleOpenResource = (resource: Resource) => {
    if (isExternalResource(resource)) {
      window.open(resource.url, "_blank")
    } else {
      router.push(`/resource/${resource.id}`)
    }
  }

  return (
    <AppLayout>
      <div className="p-12">
        {/* Page Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <nav className="flex gap-2 mb-4">
                <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Discover</span>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Browse</span>
              </nav>
              <h2 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
                Browse <span className="text-accent-cyan">All</span>
              </h2>
              <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
                Explore learning materials from multiple free sources
              </p>
            </div>
            <div className="flex gap-4">
              <button className="glass-panel px-6 py-3 border border-white/20 font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_list</span> Filter
              </button>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <Input
                type="search"
                placeholder="Search books, articles, papers, videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 font-sans"
              />
            </div>
            <button type="submit" className="bg-accent-cyan text-black px-6 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 h-10 bg-white/[0.03] border-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10">
                <SelectItem value="all">All Types</SelectItem>
                {allTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeNames[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40 h-10 bg-white/[0.03] border-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10">
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subjectNames[subject]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-10 bg-white/[0.03] border-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rated">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button onClick={clearFilters} className="h-10 px-4 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">close</span> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">
            Showing <span className="text-accent-cyan">{resources.length}</span> of{" "}
            <span className="text-white">{pagination.total}</span> resources
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/10 p-6 animate-pulse">
                <div className="aspect-[16/10] bg-white/5 mb-4" />
                <div className="h-4 bg-white/5 mb-2 w-3/4" />
                <div className="h-3 bg-white/5 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="size-32 bg-accent-cyan/5 border-2 border-dashed border-accent-cyan flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-accent-cyan font-thin">search_off</span>
              </div>
            </div>
            <h3 className="font-serif text-4xl font-black text-white italic mb-2">No Results</h3>
            <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm">No resources found. Try adjusting your filters or search query.</p>
            <button onClick={clearFilters} className="mt-8 bg-white text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] hover:bg-accent-cyan transition-colors">
              Clear Filters
            </button>
          </div>
        )}

        {/* Resources Grid */}
        {!isLoading && resources.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource) => {
                const isSaved = resource.userInteraction?.saved || false
                const userRating = resource.userInteraction?.rating
                const isExternal = isExternalResource(resource)
                const externalBadge = getExternalTypeBadge(resource.type)

                return (
                  <div key={resource.id} className="group relative bg-[#0a0a0a] border border-white/10 hover:border-accent-cyan/50 transition-all duration-500 overflow-hidden">
                    {/* Image */}
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                      <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap">
                        {isExternal ? (
                          <span className={`${externalBadge.bg} ${externalBadge.text} px-2 py-1 font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-1`}>
                            <span className="material-symbols-outlined text-xs">{externalBadge.icon}</span> {typeNames[resource.type]}
                          </span>
                        ) : (
                          <>
                            <span className="tag-cyan">{subjectNames[resource.subject]}</span>
                            <span className="tag-lime">{typeNames[resource.type]}</span>
                          </>
                        )}
                      </div>
                      
                      {isExternal && resource.thumbnail ? (
                        <img 
                          src={resource.thumbnail} 
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${subjectGradients[resource.subject] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-white/50 text-4xl">
                            {getResourceIcon(resource.type)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 glossy-gradient pointer-events-none" />
                      
                      {/* Play overlay for video types */}
                      {resource.type === "youtube" && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="size-16 bg-red-500/90 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl filled">play_arrow</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-2xl font-bold text-white leading-tight group-hover:text-glow-cyan transition-all line-clamp-2">
                          {resource.title}
                        </h3>
                        {!isExternal && (
                          <button 
                            className={`size-8 flex items-center justify-center shrink-0 ml-2 ${isSaved ? 'bg-accent-cyan text-black shadow-[2px_2px_0px_#CCFF00]' : 'border border-white/20 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan'} transition-all`}
                            onClick={() => handleSave(resource.id, isSaved)}
                          >
                            <span className="material-symbols-outlined text-sm">{isSaved ? 'bookmark_added' : 'bookmark'}</span>
                          </button>
                        )}
                      </div>
                      
                      <p className="font-mono text-xs text-slate-500 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">person</span> 
                        {resource.channelTitle || resource.author}
                      </p>
                      
                      {/* GitHub-specific stats */}
                      {resource.type === "github" && (
                        <div className="flex items-center gap-4 mb-4">
                          {resource.language && (
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                              <span 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: resource.languageColor || '#858585' }}
                              />
                              {resource.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <span className="material-symbols-outlined text-xs">star</span>
                            {resource.likeCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <span className="material-symbols-outlined text-xs">call_split</span>
                            {resource.forksCount?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                        {isExternal ? (
                          <span className={`font-mono text-[10px] uppercase tracking-widest flex items-center gap-1 ${externalBadge.text.replace('text-white', 'text-white/70')}`}>
                            <span className="material-symbols-outlined text-xs">{getResourceIcon(resource.type)}</span> 
                            {getExternalLinkLabel(resource.type)}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button 
                              className={`flex items-center gap-1 px-2 py-1 ${userRating === 1 ? 'bg-accent-lime text-black' : 'text-slate-500 hover:text-accent-lime'} transition-all`}
                              onClick={() => handleRate(resource.id, 1)}
                            >
                              <span className="material-symbols-outlined text-sm">thumb_up</span>
                              <span className="font-mono text-[10px]">{resource.likeCount}</span>
                            </button>
                            <button 
                              className={`px-2 py-1 ${userRating === -1 ? 'text-red-400' : 'text-slate-500 hover:text-red-400'} transition-all`}
                              onClick={() => handleRate(resource.id, -1)}
                            >
                              <span className="material-symbols-outlined text-sm">thumb_down</span>
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={() => handleOpenResource(resource)}
                          className="font-mono text-[10px] text-accent-cyan uppercase tracking-widest font-bold flex items-center gap-1 group/link"
                        >
                          {isExternal ? 'Open' : 'Open'} <span className="material-symbols-outlined text-xs group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-20 flex justify-center gap-2">
                <button
                  className="group relative px-6 py-3 border border-white/20 font-mono text-[10px] uppercase tracking-widest text-white hover:text-black transition-all disabled:opacity-50"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <div className="absolute inset-0 bg-accent-lime scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  <span className="relative z-10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Prev
                  </span>
                </button>
                
                <div className="flex items-center gap-1 px-4">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`w-10 h-10 font-mono text-xs ${pagination.page === pageNum ? 'bg-accent-cyan text-black font-bold' : 'text-slate-400 hover:text-white'} transition-all`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  className="group relative px-6 py-3 border border-white/20 font-mono text-[10px] uppercase tracking-widest text-white hover:text-black transition-all disabled:opacity-50"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <div className="absolute inset-0 bg-accent-lime scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  <span className="relative z-10 flex items-center gap-1">
                    Next <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
