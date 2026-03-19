"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookmarkCheck,
  BookOpen,
  FileText,
  Video,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { AppLayout } from "@/components/shared"
import { subjectNames, typeNames, subjectGradients } from "@/lib/constants"

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
  savedAt: string | null
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

export default function SavedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const fetchSaved = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/saved?page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 })
      }
    } catch {
      console.error("Failed to fetch saved resources")
      toast.error("Failed to load saved resources")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSaved()
    }
  }, [session])

  const handleRate = async (resourceId: string, rating: 1 | -1) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })
      if (response.ok) {
        toast.success(rating === 1 ? "Liked!" : "Disliked")
        setResources(prev => prev.map(r =>
          r.id === resourceId
            ? { ...r, userInteraction: { ...r.userInteraction!, rating } }
            : r
        ))
      }
    } catch {
      toast.error("Failed to rate resource")
    }
  }

  const handleUnsave = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/save`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Removed from saved")
        setResources(prev => prev.filter(r => r.id !== resourceId))
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
      }
    } catch {
      toast.error("Failed to remove resource")
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handlePageChange = (newPage: number) => {
    fetchSaved(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-primary/20 text-primary text-xs font-semibold mb-4">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Your Collection
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Saved <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Your personal collection of bookmarked learning materials
          </p>
        </div>

        {/* Empty State */}
        {!isLoading && resources.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No saved resources yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start saving resources you find interesting to build your personal learning collection.
            </p>
            <Link href="/">
              <Button className="accent-gradient shadow-lg shadow-primary/30 gap-2">
                <Sparkles className="w-4 h-4" />
                Browse Resources
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        {!isLoading && resources.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm text-slate-500">
              <span className="text-white font-semibold">{pagination.total}</span> saved resource{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Resources Grid */}
        {!isLoading && resources.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type)
                const userRating = resource.userInteraction?.rating

                return (
                  <Card key={resource.id} className="glass-panel border-white/5 hover:border-primary/30 transition-all overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex gap-4">
                          <Link href={`/resource/${resource.id}`} className="shrink-0">
                            <div className={`w-16 h-20 rounded-xl flex items-center justify-center overflow-hidden ${
                              resource.thumbnail ? "" : "bg-gradient-to-br " + subjectGradients[resource.subject]
                            }`}>
                              {resource.thumbnail ? (
                                <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover" />
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
                      {/* Saved date */}
                      {resource.savedAt && (
                        <div className="px-4 pb-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          Saved {formatDate(resource.savedAt)}
                        </div>
                      )}
                      <div className="border-t border-white/5 p-3 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={`h-9 px-3 ${userRating === 1 ? "bg-primary text-white" : "text-slate-400"}`} 
                            onClick={() => handleRate(resource.id, 1)}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {resource.likeCount}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={`h-9 px-3 ${userRating === -1 ? "bg-red-500 text-white" : "text-slate-400"}`} 
                            onClick={() => handleRate(resource.id, -1)}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleUnsave(resource.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
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
    </AppLayout>
  )
}
