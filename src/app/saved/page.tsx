"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

const filterTabs = [
  { id: "all", label: "All Items" },
  { id: "programming", label: "Programming" },
  { id: "mathematics", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "languages", label: "Languages" },
  { id: "history", label: "History" },
  { id: "business", label: "Business" },
]

export default function SavedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchSaved(pagination.page + 1)
    }
  }

  // Filter resources based on active filter
  const filteredResources = activeFilter === "all" 
    ? resources 
    : resources.filter(r => r.subject === activeFilter)

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header Section */}
      <header className="p-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <nav className="flex gap-2 mb-4">
              <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Personal</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Archive</span>
            </nav>
            <h2 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
              Saved <span className="text-accent-cyan">Resources</span>
            </h2>
            <p className="font-display text-lg text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
              Your personal library of curated learning materials. Synchronized across all devices.
            </p>
          </div>
          <div className="flex gap-4">
            {/* Filter tabs available below */}
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <section className="p-12 pt-6 flex-1">
        {/* Filters/Tabs */}
        {resources.length > 0 && (
          <div className="flex border-b border-white/10 mb-12 gap-12 overflow-x-auto scrollbar-brutalist">
            {filterTabs.map((tab) => {
              const count = tab.id === "all" 
                ? resources.length 
                : resources.filter(r => r.subject === tab.id).length
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`pb-4 border-b-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                    activeFilter === tab.id
                      ? "border-accent-cyan text-accent-cyan font-bold"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="size-32 bg-accent-cyan/5 border-2 border-dashed border-accent-cyan flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-accent-cyan font-thin">inventory_2</span>
              </div>
              <div className="absolute -bottom-4 -right-4 size-16 bg-accent-lime flex items-center justify-center shadow-[4px_4px_0px_#000]">
                <span className="material-symbols-outlined text-black font-black">close</span>
              </div>
            </div>
            <h3 className="font-serif text-4xl font-black text-white italic mb-2">Void Encountered</h3>
            <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm">
              No resources have been tagged for later retrieval. Explore the library to fill this space.
            </p>
            <Link href="/">
              <button className="mt-8 bg-white text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] hover:bg-accent-cyan transition-colors">
                Start Browsing
              </button>
            </Link>
          </div>
        )}

        {/* Filtered Empty State */}
        {!isLoading && resources.length > 0 && filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-20 bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-500">filter_list_off</span>
            </div>
            <h3 className="font-serif text-2xl font-black text-white italic mb-2">No Matches</h3>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
              No saved resources in this category.
            </p>
            <button 
              onClick={() => setActiveFilter("all")}
              className="mt-6 bg-accent-cyan/10 text-accent-cyan px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest border border-accent-cyan/30 hover:bg-accent-cyan hover:text-black transition-all"
            >
              Show All Items
            </button>
          </div>
        )}

        {/* Resource Cards Grid */}
        {!isLoading && filteredResources.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => {
                const userRating = resource.userInteraction?.rating

                return (
                  <div key={resource.id} className="group relative bg-[#0a0a0a] border border-white/10 hover:border-accent-cyan/50 transition-all duration-500 overflow-hidden">
                    {/* Image */}
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                      <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <span className="bg-black/80 backdrop-blur-md border border-accent-cyan/30 text-accent-cyan px-2 py-1 font-mono text-[9px] uppercase tracking-widest">{subjectNames[resource.subject]}</span>
                        <span className="bg-accent-lime text-black px-2 py-1 font-mono text-[9px] uppercase font-bold tracking-widest">{typeNames[resource.type]}</span>
                      </div>
                      <div className={`w-full h-full bg-gradient-to-br ${subjectGradients[resource.subject]} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white/50 text-4xl">
                          {resource.type === 'book' ? 'menu_book' : resource.type === 'video' ? 'play_circle' : 'article'}
                        </span>
                      </div>
                      <div className="absolute inset-0 glossy-gradient pointer-events-none" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-2xl font-bold text-white leading-tight group-hover:text-glow-cyan transition-all">
                          {resource.title}
                        </h3>
                        <button 
                          className="size-8 flex items-center justify-center bg-accent-cyan text-black shadow-[2px_2px_0px_#CCFF00]"
                          onClick={() => handleUnsave(resource.id)}
                          title="Remove from saved"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">bookmark_added</span>
                        </button>
                      </div>
                      <p className="font-mono text-xs text-slate-500 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">person</span> {resource.author}
                      </p>
                      <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                        <span className="font-mono text-[10px] text-slate-600 uppercase">
                          Saved on {formatDate(resource.savedAt)}
                        </span>
                        <Link href={`/resource/${resource.id}`} className="font-mono text-[10px] text-accent-cyan uppercase tracking-widest font-bold flex items-center gap-1 group/link">
                          Open Module <span className="material-symbols-outlined text-xs group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination/Load More */}
            {pagination.page < pagination.totalPages && (
              <div className="mt-20 flex justify-center">
                <button 
                  onClick={handleLoadMore}
                  className="group relative px-12 py-6 border border-white/20 font-mono text-[10px] uppercase tracking-[0.5em] text-white hover:text-black transition-all"
                >
                  <div className="absolute inset-0 bg-accent-lime scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  <span className="relative z-10">Load More Resources</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </AppLayout>
  )
}
