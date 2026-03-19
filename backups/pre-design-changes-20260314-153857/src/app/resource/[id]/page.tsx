"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  AlertCircle,
  BookOpen,
  FileText,
  Video,
  PlayCircle,
  Share2,
  Clock,
  User,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { AppLayout } from "@/components/shared"
import {
  subjectNames,
  typeNames,
  subjectGradients,
  difficultyColors,
  subjectIcons,
} from "@/lib/constants"

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

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [resource, setResource] = useState<Resource | null>(null)
  const [similarResources, setSimilarResources] = useState<Resource[]>([])
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchResource = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/resources/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setResource(data.resource)
          setSimilarResources(data.similarResources || [])
          
          // Fetch YouTube videos for this resource
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
        // Refresh resource
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

  const handleSave = async () => {
    if (!resource) return
    
    try {
      const currentlySaved = resource.userInteraction?.saved || false
      const method = currentlySaved ? "DELETE" : "POST"
      const response = await fetch(`/api/resources/${resource.id}/save`, { method })
      if (response.ok) {
        toast.success(currentlySaved ? "Removed from saved" : "Saved!")
        // Update local state
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

  const handleShare = async () => {
    if (!resource) return

    const url = window.location.href

    // Try modern clipboard API first (works in HTTPS and localhost)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
        return
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback for older browsers or non-HTTPS contexts
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book": return BookOpen
      case "article": return FileText
      case "video": return Video
      default: return BookOpen
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!resource) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Resource not found</h3>
            <p className="text-slate-400 mb-6">This resource may have been removed or doesn't exist.</p>
            <Link href="/">
              <Button className="accent-gradient shadow-lg shadow-primary/30">
                Browse Resources
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const TypeIcon = getTypeIcon(resource.type)
  const SubjectIcon = subjectIcons[resource.subject]
  const isSaved = resource.userInteraction?.saved || false
  const userRating = resource.userInteraction?.rating

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Header */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className={`w-24 h-32 rounded-xl flex items-center justify-center shrink-0 ${
                    resource.thumbnail ? "" : "bg-gradient-to-br " + subjectGradients[resource.subject]
                  }`}>
                    {resource.thumbnail ? (
                      <img 
                        src={resource.thumbnail} 
                        alt={resource.title} 
                        className="w-full h-full object-cover rounded-xl" 
                      />
                    ) : (
                      <TypeIcon className="w-12 h-12 text-white/80" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="text-[10px] uppercase tracking-wider font-semibold bg-primary/20 text-primary border-0">
                        {typeNames[resource.type]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-white/10 text-slate-400">
                        {subjectNames[resource.subject]}
                      </Badge>
                      <Badge className={`text-[10px] uppercase tracking-wider font-semibold ${difficultyColors[resource.difficulty]}`}>
                        {resource.difficulty}
                      </Badge>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                      {resource.title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {resource.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <Button className="accent-gradient shadow-lg shadow-primary/30 gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Open Resource
                        </Button>
                      </a>
                      
                      <Button
                        variant="outline"
                        className={`border-white/10 ${userRating === 1 ? "bg-primary text-white border-primary" : "text-slate-300"}`}
                        onClick={() => handleRate(1)}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {resource.likeCount}
                      </Button>

                      <Button
                        variant="outline"
                        className={`border-white/10 ${userRating === -1 ? "bg-red-500 text-white border-red-500" : "text-slate-300"}`}
                        onClick={() => handleRate(-1)}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        className={`border-white/10 ${isSaved ? "bg-primary/20 text-primary border-primary/30" : "text-slate-300"}`}
                        onClick={handleSave}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="w-4 h-4 mr-1" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        className="text-slate-400"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                <p className="text-slate-300 leading-relaxed">{resource.description}</p>
                
                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/10 text-slate-400 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* YouTube Videos */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PlayCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-white">Related Videos</h2>
                </div>

                {isLoadingVideos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : youtubeVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {youtubeVideos.map((video) => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        <div className="glass-panel rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                          <div className="relative aspect-video">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-white line-clamp-2">{video.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{video.channelTitle}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No related videos found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Views</span>
                    <span className="text-white font-semibold">{resource.viewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Likes</span>
                    <span className="text-white font-semibold">{resource.likeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subject</span>
                    <div className="flex items-center gap-1">
                      <SubjectIcon className="w-4 h-4 text-primary" />
                      <span className="text-white font-semibold">{subjectNames[resource.subject]}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <div className="flex items-center gap-1">
                      <TypeIcon className="w-4 h-4 text-primary" />
                      <span className="text-white font-semibold">{typeNames[resource.type]}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Resources */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Similar Resources</h3>
                <div className="space-y-3">
                  {similarResources.slice(0, 5).map((similar) => {
                    const SimilarIcon = getTypeIcon(similar.type)
                    return (
                      <Link key={similar.id} href={`/resource/${similar.id}`}>
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div className={`w-10 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                            similar.thumbnail ? "" : "bg-gradient-to-br " + subjectGradients[similar.subject]
                          }`}>
                            {similar.thumbnail ? (
                              <img src={similar.thumbnail} alt={similar.title} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <SimilarIcon className="w-5 h-5 text-white/80" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white line-clamp-2">{similar.title}</p>
                            <p className="text-xs text-slate-400">{subjectNames[similar.subject]}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
