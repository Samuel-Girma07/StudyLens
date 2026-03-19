"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  BookOpen,
  FileText,
  Video,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Settings,
  ArrowRight,
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
  userInteraction?: {
    rating: number | null
    saved: boolean
  }
  recommendationReason?: string
}

export default function ForYouPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check profile status
        const profileRes = await fetch("/api/profile")
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setHasProfile(!!profileData.profile?.onboardingCompleted)
        }

        // Fetch recommendations
        const recsRes = await fetch("/api/recommendations")
        if (recsRes.ok) {
          const recsData = await recsRes.json()
          setResources(recsData.resources || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchData()
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
        // Refresh recommendations
        const recsRes = await fetch("/api/recommendations")
        if (recsRes.ok) {
          const recsData = await recsRes.json()
          setResources(recsData.resources || [])
        }
      }
    } catch (error) {
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
    } catch (error) {
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
            <Sparkles className="w-3.5 h-3.5" />
            Personalized for You
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Your <span className="gradient-text">Recommendations</span>
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Resources tailored to your learning preferences and interests
          </p>
        </div>

        {/* No Profile Warning */}
        {!hasProfile && (
          <Card className="glass-panel border-primary/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Set Your Preferences
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Complete your profile to get personalized recommendations based on your subjects, formats, and experience level.
                  </p>
                  <Link href="/onboarding">
                    <Button className="accent-gradient shadow-lg shadow-primary/30 gap-2">
                      Set Preferences
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && resources.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No recommendations yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start by browsing resources and rating them. We'll learn your preferences and suggest similar content.
            </p>
            <Link href="/">
              <Button className="accent-gradient shadow-lg shadow-primary/30">
                Browse Resources
              </Button>
            </Link>
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && resources.length > 0 && (
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
                    {/* Recommendation Reason */}
                    {resource.recommendationReason && (
                      <div className="px-4 pb-2">
                        <p className="text-xs text-primary/80 italic">
                          {resource.recommendationReason}
                        </p>
                      </div>
                    )}
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
        )}
      </div>
    </AppLayout>
  )
}
