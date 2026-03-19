"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookOpen,
  FileText,
  Video,
  Search,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Sparkles,
  X,
  Compass,
  Heart,
  ArrowRight,
  Library,
  Users,
  Layers,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { subjectNames, typeNames, subjectGradients, allSubjects } from "@/lib/constants"
import { AppLayout } from "@/components/shared"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

// ============================================
// Landing Page Component
// ============================================
function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl accent-gradient shadow-2xl shadow-primary/30 mb-8">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Discover Your Next{" "}
            <span className="gradient-text">Learning Journey</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Personalized study resource recommendations powered by intelligent content-based filtering. 
            Find the perfect books, articles, and videos for your learning goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="h-14 px-8 accent-gradient shadow-lg shadow-primary/30 text-lg font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-lg font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16">
            {[
              { value: "10,000+", label: "Resources", icon: Library },
              { value: "5,000+", label: "Users", icon: Users },
              { value: "6", label: "Subjects", icon: Layers },
              { value: "50,000+", label: "Recommendations", icon: Wand2 },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-primary text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Smarter Learning, Better Results
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Smart Recommendations", description: "AI-powered suggestions tailored to your learning style and goals.", color: "text-amber-500 bg-amber-500/10" },
              { icon: Compass, title: "Curated Content", description: "Expert-selected resources across multiple subjects and formats.", color: "text-blue-500 bg-blue-500/10" },
              { icon: Heart, title: "Rate & Save", description: "Like, dislike, and bookmark resources to refine your preferences.", color: "text-rose-500 bg-rose-500/10" },
              { icon: BookOpen, title: "Explainable AI", description: "Understand why each resource was recommended to you.", color: "text-purple-500 bg-purple-500/10" },
            ].map((feature, index) => (
              <div key={index} className="glass-panel rounded-2xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="accent-gradient rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Join thousands of learners who have discovered their perfect study resources with StudyLens.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 h-14 px-8 text-lg font-semibold">
                  Create Your Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} StudyLens. Crafted with precision.</p>
          <div className="flex gap-6 text-xs uppercase tracking-wide font-semibold text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// Browse Page Component
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

function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [hasFilters, setHasFilters] = useState(false)

  // Use URL params as the source of truth for filters
  const typeFilter = searchParams.get("type") || "all"
  const subjectFilter = searchParams.get("subject") || "all"
  const sortBy = searchParams.get("sort") || "popular"

  // Helper to update URL params
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

  // Fetch resources when URL params change
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
    // Find current resource state
    const currentResource = resources.find(r => r.id === resourceId)
    if (!currentResource) return

    const currentRating = currentResource.userInteraction?.rating

    // Optimistic update
    setResources(prev => prev.map(r => {
      if (r.id !== resourceId) return r

      let newLikeCount = r.likeCount
      let newRating: number | null = rating

      // If clicking the same rating, remove it
      if (currentRating === rating) {
        newRating = null
        if (rating === 1) newLikeCount = Math.max(0, r.likeCount - 1)
      } else if (currentRating === 1) {
        // Changing from like to dislike
        newLikeCount = Math.max(0, r.likeCount - 1)
      } else if (rating === 1) {
        // Adding a like
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
        // Revert on error
        fetchResources(pagination.page)
        toast.error("Failed to rate resource")
      }
    } catch {
      // Revert on error
      fetchResources(pagination.page)
      toast.error("Failed to rate resource")
    }
  }

  const handleSave = async (resourceId: string, currentlySaved: boolean) => {
    try {
      const method = currentlySaved ? "DELETE" : "POST"
      const response = await fetch(`/api/resources/${resourceId}/save`, { method })
      if (response.ok) {
        toast.success(currentlySaved ? "Removed from saved" : "Saved!")
        // Update local state
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book": return BookOpen
      case "article": return FileText
      case "video": return Video
      default: return BookOpen
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchResources(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-primary/20 text-primary text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Premium Resources
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Browse <span className="gradient-text">Resources</span>
        </h1>
        <p className="text-lg text-slate-400 mt-2">
          Explore our curated collection of premium learning materials
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="search"
              placeholder="Search books, articles, videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/50 rounded-xl"
            />
          </div>
          <Button type="submit" className="h-14 px-8 accent-gradient shadow-lg shadow-primary/30">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-11 bg-white/5 border-white/10 text-slate-300 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="book">Books</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-44 h-11 bg-white/5 border-white/10 text-slate-300 rounded-xl">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10">
              <SelectItem value="all">All Subjects</SelectItem>
              {allSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subjectNames[subject]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-11 bg-white/5 border-white/10 text-slate-300 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10">
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rated">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-11 text-slate-400 hover:text-white">
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {!isLoading && (
        <p className="text-sm text-slate-500 mb-6">
          Showing <span className="text-white">{resources.length}</span> of{" "}
          <span className="text-white">{pagination.total}</span> resources
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-panel border-white/5 animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-20 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && resources.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={clearFilters} className="border-white/10 text-slate-300">
            Clear all filters
          </Button>
        </div>
      )}

      {/* Resources Grid */}
      {!isLoading && resources.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type)
              const isSaved = resource.userInteraction?.saved || false
              const userRating = resource.userInteraction?.rating

              return (
                <Card key={resource.id} className="glass-panel border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex gap-4">
                        <Link href={`/resource/${resource.id}`} className="shrink-0">
                          <div className={`w-16 h-20 rounded-xl flex items-center justify-center ${
                            resource.thumbnail ? "" : "bg-gradient-to-br " + subjectGradients[resource.subject]
                          }`}>
                            {resource.thumbnail ? (
                              <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <TypeIcon className="w-8 h-8 text-white/80" />
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/resource/${resource.id}`}>
                            <h3 className="font-semibold text-white line-clamp-2 hover:text-primary transition-colors">
                              {resource.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-slate-500 truncate mt-1">{resource.author}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className="text-[10px] uppercase tracking-wider font-semibold bg-primary/20 text-primary border-0">
                              {typeNames[resource.type]}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-white/10 text-slate-400">
                              {subjectNames[resource.subject]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-3">
                      <p className="text-sm text-slate-400 line-clamp-2">{resource.description}</p>
                    </div>
                    <div className="border-t border-white/5 p-3 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className={`h-9 px-3 ${userRating === 1 ? "bg-primary text-white" : "text-slate-400"}`} onClick={() => handleRate(resource.id, 1)}>
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {resource.likeCount}
                        </Button>
                        <Button size="sm" variant="ghost" className={`h-9 px-3 ${userRating === -1 ? "bg-red-500 text-white" : "text-slate-400"}`} onClick={() => handleRate(resource.id, -1)}>
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button size="sm" variant="ghost" className={`h-9 px-3 ${isSaved ? "text-primary bg-primary/10" : "text-slate-400"}`} onClick={() => handleSave(resource.id, isSaved)}>
                        {isSaved ? (<><BookmarkCheck className="w-4 h-4 mr-1" />Saved</>) : (<Bookmark className="w-4 h-4" />)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
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
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={`w-9 h-9 ${pagination.page === pageNum ? "accent-gradient" : "text-slate-400"}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================
// Main Home Page
// ============================================
export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <LandingPage />
  }

  return (
    <AppLayout>
      <BrowsePage />
    </AppLayout>
  )
}
