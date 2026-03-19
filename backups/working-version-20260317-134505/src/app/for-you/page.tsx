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
        const profileRes = await fetch("/api/profile")
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setHasProfile(!!profileData.profile?.onboardingCompleted)
        }

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

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    )
  }

  const likedCount = resources.filter(r => r.userInteraction?.rating === 1).length
  const savedCount = resources.filter(r => r.userInteraction?.saved).length

  return (
    <AppLayout>
      <div className="p-12">
        {/* Page Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <nav className="flex gap-2 mb-4">
                <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">AI</span>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Personalized</span>
              </nav>
              <h2 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
                For <span className="text-accent-cyan">You</span>
              </h2>
              <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
                AI-powered recommendations tailored to your learning preferences and interests.
              </p>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        {resources.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-[#0a0a0a] border border-accent-cyan/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 bg-accent-cyan flex items-center justify-center border border-accent-lime shadow-[1px_1px_0px_#CCFF00]">
                  <span className="material-symbols-outlined text-black text-sm">psychology</span>
                </div>
                <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">MATCHED</span>
              </div>
              <div className="font-serif text-3xl font-black text-white">{resources.length}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Resources found</div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[1px_1px_0px_#00FFFF]">
                  <span className="material-symbols-outlined text-black text-sm">thumb_up</span>
                </div>
                <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">LIKED</span>
              </div>
              <div className="font-serif text-3xl font-black text-white">{likedCount}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Resources liked</div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 bg-white/[0.05] flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-sm">bookmark</span>
                </div>
                <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">SAVED</span>
              </div>
              <div className="font-serif text-3xl font-black text-white">{savedCount}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">For later</div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 bg-white/[0.05] flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-sm">target</span>
                </div>
                <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">STATUS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 bg-accent-lime animate-pulse" />
                <span className="font-serif text-lg font-bold text-white">Active</span>
              </div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Learning</div>
            </div>
          </div>
        )}

        {/* No Profile Warning */}
        {!hasProfile && (
          <div className="relative overflow-hidden border border-accent-lime/20 mb-8 bg-[#0a0a0a]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-lime" />
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="size-14 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                  <span className="material-symbols-outlined text-black text-2xl">settings</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-bold text-white italic mb-2">
                    Set Your <span className="text-accent-lime">Preferences</span>
                  </h3>
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-wider mb-4">
                    Complete your profile to get personalized recommendations based on your subjects and experience level.
                  </p>
                  <Link href="/onboarding">
                    <button className="bg-accent-lime text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all">
                      Set Preferences
                      <span className="material-symbols-outlined text-sm ml-1 align-middle">arrow_forward</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="size-32 bg-accent-cyan/5 border-2 border-dashed border-accent-cyan flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-accent-cyan font-thin">search_off</span>
              </div>
              <div className="absolute -bottom-4 -right-4 size-16 bg-accent-lime flex items-center justify-center shadow-[4px_4px_0px_#000]">
                <span className="material-symbols-outlined text-black font-bold">close</span>
              </div>
            </div>
            <h3 className="font-serif text-4xl font-black text-white italic mb-2">No Recommendations</h3>
            <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm">
              Start by browsing resources and rating them. We&apos;ll learn your preferences and suggest similar content.
            </p>
            <Link href="/">
              <button className="mt-8 bg-white text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] hover:bg-accent-cyan transition-colors">
                Browse Resources
              </button>
            </Link>
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => {
              const isSaved = resource.userInteraction?.saved || false
              const userRating = resource.userInteraction?.rating

              return (
                <div key={resource.id} className="group relative bg-[#0a0a0a] border border-white/10 hover:border-accent-cyan/50 transition-all duration-500 overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <span className="tag-cyan">{subjectNames[resource.subject]}</span>
                      <span className="tag-lime">{typeNames[resource.type]}</span>
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
                    {/* Recommendation Reason */}
                    {resource.recommendationReason && (
                      <div className="mb-4">
                        <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                          {resource.recommendationReason}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-serif text-2xl font-bold text-white leading-tight group-hover:text-glow-cyan transition-all">
                        {resource.title}
                      </h3>
                      <button 
                        className={`size-8 flex items-center justify-center ${isSaved ? 'bg-accent-cyan text-black shadow-[2px_2px_0px_#CCFF00]' : 'border border-white/20 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan'} transition-all`}
                        onClick={() => handleSave(resource.id, isSaved)}
                      >
                        <span className="material-symbols-outlined text-sm">{isSaved ? 'bookmark_added' : 'bookmark'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-500 mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">person</span> {resource.author}
                    </p>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
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
                      <Link href={`/resource/${resource.id}`} className="font-mono text-[10px] text-accent-cyan uppercase tracking-widest font-bold flex items-center gap-1 group/link">
                        Open <span className="material-symbols-outlined text-xs group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
