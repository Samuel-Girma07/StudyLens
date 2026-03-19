"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { AppLayout } from "@/components/shared"
import { TutorChat } from "@/components/tutor"
import {
  subjectNames,
  typeNames,
  subjectGradients,
  difficultyColors,
  difficultyNames,
} from "@/lib/constants"

// ============================================
// TYPES
// ============================================
interface Resource {
  id: string
  title: string
  description: string
  author: string
  type: string
  subject: string
  thumbnail: string | null
  url: string
  difficulty: string
  tags: string[]
  likeCount: number
  viewCount: number
  createdAt: string
  userInteraction?: {
    rating: number | null
    saved: boolean
  } | null
}

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
}

// ============================================
// RESOURCE DETAIL PAGE - GLOSSY BRUTALIST
// ============================================
export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [resource, setResource] = useState<Resource | null>(null)
  const [similarResources, setSimilarResources] = useState<Resource[]>([])
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch resource data
  useEffect(() => {
    const fetchResource = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/resources/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setResource(data.resource)
          setSimilarResources(data.similarResources || [])
          fetchYouTubeVideos(data.resource)
        } else {
          toast.error("Resource not found")
          router.push("/")
        }
      } catch (error) {
        console.error("Failed to fetch resource:", error)
        toast.error("Failed to load resource")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && session) {
      fetchResource()
    }
  }, [params.id, session, router])

  // Fetch YouTube videos
  const fetchYouTubeVideos = async (res: Resource) => {
    setIsLoadingVideos(true)
    try {
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(res.title + " " + res.subject)}`)
      if (response.ok) {
        const data = await response.json()
        setYoutubeVideos(data.videos || [])
      }
    } catch (error) {
      console.error("Failed to fetch YouTube videos:", error)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  // Handle like/dislike
  const handleRate = async (rating: 1 | -1) => {
    if (!resource) return
    
    try {
      const response = await fetch(`/api/resources/${resource.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })
      if (response.ok) {
        toast.success(rating === 1 ? "Liked!" : "Disliked")
        const res = await fetch(`/api/resources/${resource.id}`)
        if (res.ok) {
          const data = await res.json()
          setResource(data.resource)
        }
      }
    } catch (error) {
      toast.error("Failed to rate resource")
    }
  }

  // Handle save/unsave
  const handleSave = async () => {
    if (!resource) return
    
    try {
      const currentlySaved = resource.userInteraction?.saved || false
      const method = currentlySaved ? "DELETE" : "POST"
      const response = await fetch(`/api/resources/${resource.id}/save`, { method })
      if (response.ok) {
        toast.success(currentlySaved ? "Removed from saved" : "Saved!")
        setResource(prev => prev ? {
          ...prev,
          userInteraction: {
            rating: prev.userInteraction?.rating || null,
            saved: !currentlySaved,
          },
        } : null)
      }
    } catch (error) {
      toast.error("Failed to save resource")
    }
  }

  // Handle share
  const handleShare = async () => {
    if (!resource) return
    const url = window.location.href

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
        return
      } catch {
        // Fall through to fallback
      }
    }

    try {
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    )
  }

  // Not found state
  if (!resource) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-12 text-center">
          <div className="size-32 bg-accent-cyan/5 border-2 border-dashed border-accent-cyan flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-6xl text-accent-cyan font-thin">search_off</span>
          </div>
          <h3 className="font-serif text-4xl font-black text-white italic mb-2">Not Found</h3>
          <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm mb-8">
            This resource may have been removed or doesn't exist.
          </p>
          <Link href="/">
            <button className="bg-accent-cyan text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
              Browse Resources
            </button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const isSaved = resource.userInteraction?.saved || false
  const userRating = resource.userInteraction?.rating

  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-500 hover:text-accent-cyan transition-colors"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-mono text-[10px] uppercase tracking-widest">Back</span>
          </button>
          <span className="text-slate-700">/</span>
          <Link href="/" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-accent-cyan transition-colors">
            Browse
          </Link>
          <span className="text-slate-700">/</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan">
            {resource.title.slice(0, 20)}...
          </span>
        </nav>

        {/* Hero Section with Gradient/Image */}
        <div className="relative mb-12">
          {/* Background Gradient/Image */}
          <div className={`absolute inset-0 bg-gradient-to-br ${subjectGradients[resource.subject]} opacity-20`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 pt-8 lg:pt-16 pb-8">
            {/* Tags Row */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="tag-cyan">{subjectNames[resource.subject]}</span>
              <span className="tag-lime">{typeNames[resource.type]}</span>
              <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 ${
                resource.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                resource.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                resource.difficulty === 'advanced' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
                {difficultyNames[resource.difficulty]}
              </span>
            </div>

            {/* Title - Serif Italic */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black text-white italic tracking-tighter leading-[0.9] mb-6">
              {resource.title}
            </h1>

            {/* Author and Meta */}
            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-cyan text-lg">person</span>
                <span className="font-sans text-sm">{resource.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-lime text-lg">calendar_today</span>
                <span className="font-mono text-xs uppercase tracking-widest">
                  {new Date(resource.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-cyan text-lg">visibility</span>
                <span className="font-mono text-xs uppercase tracking-widest">
                  {resource.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thumbnail Card */}
            <div className="card-brutalist overflow-hidden">
              <div className="aspect-video relative">
                {resource.thumbnail ? (
                  <Image 
                    src={resource.thumbnail} 
                    alt={`Cover thumbnail for resource: ${resource.title}`} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${subjectGradients[resource.subject]} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white/30 text-8xl">
                      {resource.type === 'book' ? 'menu_book' : resource.type === 'video' ? 'play_circle' : 'article'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 glossy-gradient pointer-events-none" />
                
                {/* Type Icon Overlay */}
                <div className="absolute bottom-4 right-4 size-14 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                  <span className="material-symbols-outlined text-black text-2xl font-bold">
                    {resource.type === 'book' ? 'menu_book' : resource.type === 'video' ? 'play_circle' : 'article'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <button className="bg-accent-cyan text-black px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined">open_in_new</span>
                  Open Resource
                </button>
              </a>
              
              <button
                onClick={() => handleRate(1)}
                className={`px-6 py-4 font-mono text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${
                  userRating === 1 
                    ? 'bg-accent-lime text-black border-accent-lime shadow-[2px_2px_0px_#00FFFF]' 
                    : 'border-white/20 text-slate-400 hover:border-accent-lime hover:text-accent-lime'
                }`}
              >
                <span className="material-symbols-outlined text-sm">thumb_up</span>
                {resource.likeCount}
              </button>

              <button
                onClick={() => handleRate(-1)}
                className={`px-4 py-4 font-mono text-xs uppercase tracking-widest border transition-all ${
                  userRating === -1 
                    ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                    : 'border-white/20 text-slate-400 hover:border-red-500/50 hover:text-red-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">thumb_down</span>
              </button>

              <button
                onClick={handleSave}
                className={`px-6 py-4 font-mono text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${
                  isSaved 
                    ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50' 
                    : 'border-white/20 text-slate-400 hover:border-accent-cyan hover:text-accent-cyan'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{isSaved ? 'bookmark_added' : 'bookmark'}</span>
                {isSaved ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-4 font-mono text-xs uppercase tracking-widest border border-white/20 text-slate-400 hover:border-white/40 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-4 font-mono text-xs uppercase tracking-widest border-2 border-accent-lime text-accent-lime hover:bg-accent-lime hover:text-black transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                Ask AI Tutor
              </button>
            </div>

            {/* Description Card */}
            <div className="card-brutalist p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-accent-lime flex items-center justify-center border-2 border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                  <span className="material-symbols-outlined text-black font-bold">description</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">About</p>
                  <h2 className="font-serif text-xl font-bold text-white italic">Description</h2>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg">{resource.description}</p>
              
              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span key={tag} className="tag-cyan">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Related YouTube Videos */}
            <div className="card-brutalist p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-red-500 flex items-center justify-center border-2 border-white/20">
                  <span className="material-symbols-outlined text-white font-bold">play_circle</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Related</p>
                  <h2 className="font-serif text-xl font-bold text-white italic">YouTube Videos</h2>
                </div>
              </div>

              {isLoadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-10 border-2 border-accent-cyan border-t-transparent animate-spin" />
                </div>
              ) : youtubeVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {youtubeVideos.slice(0, 4).map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border border-white/10 hover:border-accent-cyan/50 transition-all overflow-hidden"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={video.thumbnail}
                          alt={`YouTube video thumbnail for: ${video.title}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="size-14 bg-red-500 flex items-center justify-center border-2 border-white/30">
                            <span className="material-symbols-outlined text-white text-2xl">play_arrow</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent-cyan transition-colors">
                          {video.title}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 mt-2 uppercase tracking-widest">
                          {video.channelTitle}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-4">videocam_off</span>
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">No related videos found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="card-brutalist p-6">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">Statistics</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-cyan">visibility</span>
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Views</span>
                  </div>
                  <span className="font-serif text-xl font-bold text-white">{resource.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-lime">thumb_up</span>
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Likes</span>
                  </div>
                  <span className="font-serif text-xl font-bold text-white">{resource.likeCount}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-cyan">school</span>
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Subject</span>
                  </div>
                  <span className="font-mono text-xs text-white font-bold uppercase">{subjectNames[resource.subject]}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-lime">category</span>
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Type</span>
                  </div>
                  <span className="font-mono text-xs text-white font-bold uppercase">{typeNames[resource.type]}</span>
                </div>
              </div>
            </div>

            {/* Similar Resources */}
            <div className="card-brutalist p-6">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">Similar Resources</p>
              <div className="space-y-3">
                {similarResources.slice(0, 5).map((similar) => (
                  <Link key={similar.id} href={`/resource/${similar.id}`}>
                    <div className="group flex gap-4 p-3 border border-white/5 hover:border-accent-cyan/30 transition-all">
                      <div className={`relative w-16 h-20 shrink-0 bg-gradient-to-br ${subjectGradients[similar.subject]} flex items-center justify-center overflow-hidden`}>
                        {similar.thumbnail ? (
                          <Image src={similar.thumbnail} alt={`Thumbnail preview for similar resource: ${similar.title}`} fill className="object-cover" sizes="64px" />
                        ) : (
                          <span className="material-symbols-outlined text-white/50 text-2xl">
                            {similar.type === 'book' ? 'menu_book' : similar.type === 'video' ? 'play_circle' : 'article'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent-cyan transition-colors">
                          {similar.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="tag-cyan text-[8px]">{subjectNames[similar.subject]}</span>
                          <span className="font-mono text-[8px] text-slate-500 uppercase">{similar.likeCount} likes</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {similarResources.length === 0 && (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">library_books</span>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">No similar resources</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-brutalist p-6">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">Quick Actions</p>
              <div className="space-y-2">
                <Link href={`/?subject=${resource.subject}`}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-white/5 hover:border-accent-cyan/30 hover:bg-white/5 transition-all text-left">
                    <span className="material-symbols-outlined text-accent-cyan text-lg">explore</span>
                    <span className="font-mono text-xs text-slate-300 uppercase tracking-wider">More in {subjectNames[resource.subject]}</span>
                  </button>
                </Link>
                <Link href={`/?type=${resource.type}`}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-white/5 hover:border-accent-lime/30 hover:bg-white/5 transition-all text-left">
                    <span className="material-symbols-outlined text-accent-lime text-lg">filter_list</span>
                    <span className="font-mono text-xs text-slate-300 uppercase tracking-wider">More {typeNames[resource.type]}s</span>
                  </button>
                </Link>
                <Link href="/saved">
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left">
                    <span className="material-symbols-outlined text-slate-400 text-lg">bookmark</span>
                    <span className="font-mono text-xs text-slate-300 uppercase tracking-wider">View Saved</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tutor Chat Widget */}
      <TutorChat 
        resourceId={resource.id}
        resourceTitle={resource.title}
      />
    </AppLayout>
  )
}
