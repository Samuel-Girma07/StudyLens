"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { AppLayout } from "@/components/shared"
import { subjectNames, subjectGradients } from "@/lib/constants"

// ============================================
// DASHBOARD CONTENT COMPONENT
// ============================================
interface DashboardData {
  user: {
    name: string
    image: string | null
  }
  greeting: string
  stats: {
    views: number
    likes: number
    saved: number
    streak: number
  }
  reviewStats: {
    dueToday: number
    totalCards: number
    retentionRate: number
    reviewedToday: number
  }
  continueLearning: Array<{
    id: string
    title: string
    subject: string
    type: string
    thumbnail: string | null
    viewedAt: Date | null
  }>
  recommendations: Array<{
    id: string
    title: string
    author: string
    type: string
    subject: string
    likeCount: number
    matchPercentage: number
    reason: string
  }>
  recentActivity: Array<{
    type: string
    resourceId: string
    resourceTitle: string
    resourceSubject: string
    timestamp: string
  }>
  trending: Array<{
    id: string
    title: string
    subject: string
    likeCount: number
  }>
  hasProfile: boolean
}

// Material Symbols for types
const typeIcons: Record<string, string> = {
  book: "menu_book",
  article: "article",
  video: "play_circle",
}

// Activity icons
const activityIcons: Record<string, { icon: string; color: string }> = {
  like: { icon: "thumb_up", color: "text-accent-lime" },
  dislike: { icon: "thumb_down", color: "text-red-400" },
  save: { icon: "bookmark", color: "text-accent-cyan" },
  view: { icon: "visibility", color: "text-slate-400" },
}

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/dashboard")
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-accent-cyan">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  return (
    <div className="p-8 lg:p-12 min-h-screen">
      {/* Page Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <nav className="flex gap-2 mb-4">
              <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Home</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Overview</span>
            </nav>
            <h1 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
              Dash<span className="text-accent-cyan">board</span>
            </h1>
            <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
              {data?.greeting}, <span className="text-white font-medium">{data?.user.name}</span> — Ready to continue your learning journey?
            </p>
          </div>

          {/* Streak Badge */}
          {data?.stats.streak && data.stats.streak > 0 && (
            <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 px-5 py-3">
              <span className="material-symbols-outlined text-orange-400 text-2xl filled">local_fire_department</span>
              <div>
                <p className="text-white font-bold text-lg">{data.stats.streak} Day Streak</p>
                <p className="font-mono text-[10px] text-orange-400 uppercase tracking-widest">Keep it going!</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Views Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-5 hover:border-accent-cyan/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 bg-accent-cyan flex items-center justify-center border border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-black text-sm">visibility</span>
            </div>
            <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">VIEWS</span>
          </div>
          <div className="text-serif text-4xl font-black text-white">{data?.stats.views || 0}</div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Resources viewed</div>
        </div>

        {/* Likes Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-5 hover:border-accent-lime/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
              <span className="material-symbols-outlined text-black text-sm">thumb_up</span>
            </div>
            <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">LIKES</span>
          </div>
          <div className="text-serif text-4xl font-black text-white">{data?.stats.likes || 0}</div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Resources liked</div>
        </div>

        {/* Saved Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-5 hover:border-accent-cyan/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 bg-white/[0.05] flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-slate-400 text-sm">bookmark</span>
            </div>
            <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">SAVED</span>
          </div>
          <div className="text-serif text-4xl font-black text-white">{data?.stats.saved || 0}</div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">For later</div>
        </div>

        {/* Streak Card */}
        <div className="bg-[#0a0a0a] border border-orange-500/20 p-5 hover:border-orange-500/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500/10 blur-2xl" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="size-10 bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <span className="material-symbols-outlined text-orange-400 text-sm filled">local_fire_department</span>
            </div>
            <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">STREAK</span>
          </div>
          <div className="text-serif text-4xl font-black text-white relative z-10">{data?.stats.streak || 0}</div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest relative z-10">Day streak</div>
        </div>
      </div>

      {/* Review Widget */}
      {data?.reviewStats && data.reviewStats.dueToday > 0 && (
        <div className="mb-10 relative overflow-hidden border border-accent-lime/30 bg-[#0a0a0a]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-lime" />
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="size-16 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                  <span className="material-symbols-outlined text-black text-3xl">fact_check</span>
                </div>
                <div>
                  <h3 className="text-serif text-2xl font-bold text-white italic">
                    <span className="text-accent-lime">{data.reviewStats.dueToday}</span> Cards Due
                  </h3>
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                    Spaced repetition • {data.reviewStats.retentionRate}% retention rate
                  </p>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-end gap-6">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-serif text-xl font-black text-white">{data.reviewStats.totalCards}</p>
                    <p className="font-mono text-[9px] text-slate-500 uppercase">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-serif text-xl font-black text-accent-cyan">{data.reviewStats.reviewedToday}</p>
                    <p className="font-mono text-[9px] text-slate-500 uppercase">Today</p>
                  </div>
                </div>
                
                <Link href="/review">
                  <button className="bg-accent-lime text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    Start Review
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Continue Learning Section */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0a] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-accent-cyan flex items-center justify-center border border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                  <span className="material-symbols-outlined text-black">play_circle</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Continue Learning</h3>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Pick up where you left off</p>
                </div>
              </div>
              <Link href="/browse" className="font-mono text-xs text-accent-cyan uppercase tracking-widest hover:underline flex items-center gap-1">
                Browse All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {data?.continueLearning && data.continueLearning.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.continueLearning.map((resource) => (
                  <Link key={resource.id} href={`/resource/${resource.id}`}>
                    <div className="group">
                      <div className="aspect-video bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 mb-3 overflow-hidden flex items-center justify-center group-hover:border-accent-cyan/50 transition-all">
                        <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-accent-cyan transition-colors">
                          {typeIcons[resource.type]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent-cyan transition-colors mb-1">
                        {resource.title}
                      </p>
                      <span className="tag-cyan text-[9px]">{subjectNames[resource.subject]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-600 block mb-3">auto_stories</span>
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Start exploring to see your progress</p>
                <Link href="/browse" className="inline-block mt-4">
                  <button className="bg-accent-cyan text-black px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
                    Browse Resources
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                <span className="material-symbols-outlined text-black">grid_view</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Quick Actions</h3>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Jump to key pages</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/browse" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-all h-full">
                  <span className="material-symbols-outlined text-accent-cyan text-2xl mb-2 block">explore</span>
                  <p className="text-white font-bold text-sm">Browse</p>
                  <p className="font-mono text-[9px] text-slate-500 uppercase">All resources</p>
                </div>
              </Link>
              <Link href="/saved" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-lime/50 hover:bg-white/5 transition-all h-full">
                  <span className="material-symbols-outlined text-accent-lime text-2xl mb-2 block">bookmark</span>
                  <p className="text-white font-bold text-sm">Saved</p>
                  <p className="font-mono text-[9px] text-slate-500 uppercase">Your bookmarks</p>
                </div>
              </Link>
              <Link href="/analytics" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-all h-full">
                  <span className="material-symbols-outlined text-accent-cyan text-2xl mb-2 block">insights</span>
                  <p className="text-white font-bold text-sm">Analytics</p>
                  <p className="font-mono text-[9px] text-slate-500 uppercase">Your stats</p>
                </div>
              </Link>
              <Link href="/profile" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-lime/50 hover:bg-white/5 transition-all h-full">
                  <span className="material-symbols-outlined text-accent-lime text-2xl mb-2 block">person</span>
                  <p className="text-white font-bold text-sm">Profile</p>
                  <p className="font-mono text-[9px] text-slate-500 uppercase">Settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {data?.recommendations && data.recommendations.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-accent-cyan flex items-center justify-center border border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                <span className="material-symbols-outlined text-black">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Recommended For You</h3>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">AI-powered suggestions</p>
              </div>
            </div>
            <Link href="/for-you" className="font-mono text-xs text-accent-cyan uppercase tracking-widest hover:underline flex items-center gap-1">
              See All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommendations.map((resource) => (
              <Link key={resource.id} href={`/resource/${resource.id}`}>
                <div className="group bg-[#0a0a0a] border border-white/10 hover:border-accent-cyan/50 transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[16/10] relative">
                    <div className={`w-full h-full bg-gradient-to-br ${subjectGradients[resource.subject]} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white/50 text-4xl">
                        {typeIcons[resource.type]}
                      </span>
                    </div>
                    <div className="absolute inset-0 glossy-gradient pointer-events-none" />
                    {/* Match Badge */}
                    <div className="absolute top-3 right-3 bg-accent-lime text-black px-2 py-1 font-mono text-[10px] font-bold uppercase">
                      {resource.matchPercentage}% Match
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="font-mono text-[10px] text-accent-cyan uppercase tracking-widest flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      {resource.reason}
                    </p>
                    <h4 className="text-serif text-xl font-bold text-white group-hover:text-glow-cyan transition-all mb-2">
                      {resource.title}
                    </h4>
                    <p className="font-mono text-xs text-slate-500 flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-xs">person</span> {resource.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="tag-cyan">{subjectNames[resource.subject]}</span>
                      <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-accent-lime">thumb_up</span>
                        {resource.likeCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Recent Activity + Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 border border-accent-lime flex items-center justify-center">
              <span className="material-symbols-outlined text-accent-lime">history</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Recent Activity</h3>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Your latest interactions</p>
            </div>
          </div>

          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((activity, index) => (
                <Link key={index} href={`/resource/${activity.resourceId}`}>
                  <div className="flex items-center gap-4 p-3 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all">
                    <span className={`material-symbols-outlined ${activityIcons[activity.type]?.color || "text-slate-400"}`}>
                      {activityIcons[activity.type]?.icon || "visibility"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.resourceTitle}</p>
                      <p className="font-mono text-[10px] text-slate-500">{subjectNames[activity.resourceSubject]}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-600 block mb-2">schedule</span>
              <p className="font-mono text-xs text-slate-500">No recent activity</p>
            </div>
          )}
        </div>

        {/* Trending */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 border border-accent-cyan flex items-center justify-center">
              <span className="material-symbols-outlined text-accent-cyan">trending_up</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Trending This Week</h3>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Popular resources</p>
            </div>
          </div>

          {data?.trending && data.trending.length > 0 ? (
            <div className="space-y-2">
              {data.trending.map((resource, index) => (
                <Link key={resource.id} href={`/resource/${resource.id}`}>
                  <div className="flex items-center gap-4 p-3 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all">
                    <span className="text-serif text-xl font-black text-accent-cyan w-6 text-center">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{resource.title}</p>
                      <p className="font-mono text-[10px] text-slate-500">{subjectNames[resource.subject]}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-accent-lime">thumb_up</span>
                      {resource.likeCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-600 block mb-2">trending_up</span>
              <p className="font-mono text-xs text-slate-500">No trending data</p>
            </div>
          )}
        </div>
      </div>

      {/* No Profile Warning */}
      {data && !data.hasProfile && (
        <div className="mt-10 relative overflow-hidden border border-accent-lime/20 bg-[#0a0a0a]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-lime" />
          <div className="p-6">
            <div className="flex items-start gap-5">
              <div className="size-14 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                <span className="material-symbols-outlined text-black text-2xl">settings</span>
              </div>
              <div className="flex-1">
                <h3 className="text-serif text-2xl font-bold text-white italic mb-2">
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
    </div>
  )
}

// ============================================
// LANDING PAGE COMPONENT
// ============================================
function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex gap-2 items-center">
                <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">
                  AI-Powered
                </span>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">
                  / Learning Platform
                </span>
              </div>
              
              <h1 className="text-serif text-7xl md:text-8xl lg:text-9xl font-black text-white italic tracking-tighter leading-[0.85]">
                Study<span className="text-accent-cyan">Lens</span>
              </h1>
              
              <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
                Your personalized gateway to curated learning resources. AI-powered recommendations tailored to your journey.
              </p>
              
              <div className="flex gap-4 pt-4">
                <Link href="/auth/signup">
                  <button className="bg-accent-cyan text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
                    Get Started
                  </button>
                </Link>
                <Link href="/auth/signin">
                  <button className="glass-panel px-6 py-3 border border-white/20 font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                    Sign In
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                <div>
                  <p className="text-serif text-4xl font-black text-white">8+</p>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Data Sources</p>
                </div>
                <div>
                  <p className="text-serif text-4xl font-black text-accent-lime">Free</p>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Forever</p>
                </div>
                <div>
                  <p className="text-serif text-4xl font-black text-accent-cyan">AI</p>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Powered</p>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-5 relative">
              <div className="card-brutalist border border-white/10 p-6 relative group">
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="tag-cyan">AI</span>
                  <span className="tag-lime">Smart</span>
                </div>
                
                <div className="pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-12 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                      <span className="material-symbols-outlined text-black font-bold">auto_awesome</span>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Powered by</p>
                      <p className="text-serif text-lg font-bold text-white italic">AI Recommendations</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {['Machine Learning', 'Data Science', 'Web Development'].map((topic, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 border border-white/5 hover:border-accent-cyan/30 transition-colors">
                        <div className={`size-2 ${i === 0 ? 'bg-accent-cyan' : i === 1 ? 'bg-accent-lime' : 'bg-white'}`} />
                        <span className="font-sans text-sm text-white">{topic}</span>
                        <span className="ml-auto font-mono text-[10px] text-slate-500">{95 - i * 5}% match</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 glass-panel p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-accent-lime flex items-center justify-center border border-accent-cyan shadow-[2px_2px_0px_#00FFFF]">
                    <span className="material-symbols-outlined text-black text-sm">trending_up</span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-white">Progress</p>
                    <p className="text-serif text-lg font-bold text-accent-lime italic">Track Learning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-[10px] text-accent-lime uppercase tracking-tighter bg-accent-lime/10 px-2 py-1 italic mb-4 inline-block">
              Features
            </span>
            <h2 className="text-serif text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
              Learn <span className="text-accent-lime">Smarter</span>
            </h2>
            <p className="font-sans text-slate-400 border-l-2 border-accent-cyan pl-6 py-2">
              Our intelligent platform adapts to your learning style and goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "psychology", title: "Smart AI", description: "AI-powered suggestions tailored to your learning style." },
              { icon: "library_books", title: "Curated Content", description: "Expert-selected resources across multiple subjects." },
              { icon: "bookmark", title: "Save & Rate", description: "Like, dislike, and bookmark resources easily." },
              { icon: "analytics", title: "Track Progress", description: "Monitor your learning journey with detailed insights." },
            ].map((feature, index) => (
              <div key={index} className="group relative bg-[#0a0a0a] border border-white/10 hover:border-accent-cyan/50 transition-all duration-500 overflow-hidden p-6">
                <div className="size-14 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00] mb-4">
                  <span className="material-symbols-outlined text-black font-bold">{feature.icon}</span>
                </div>
                <h3 className="text-serif text-2xl font-bold text-white italic group-hover:text-glow-cyan transition-all mb-2">
                  {feature.title}
                </h3>
                <p className="font-mono text-xs text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center size-20 bg-accent-lime border-2 border-accent-cyan shadow-[4px_4px_0px_#00FFFF] mb-8">
            <span className="material-symbols-outlined text-black text-4xl font-bold">bolt</span>
          </div>
          
          <h2 className="text-serif text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-[0.9] mb-6">
            Ready to <span className="text-accent-cyan">Transform</span> Your Learning?
          </h2>
          
          <p className="font-sans text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of learners who have discovered their perfect study resources with StudyLens.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <button className="bg-accent-cyan text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
                Create Free Account
              </button>
            </Link>
          </div>
          
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mt-8">
            No credit card required • Free forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[1px_1px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-black text-sm font-bold">menu_book</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              © {new Date().getFullYear()} StudyLens
            </span>
          </div>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            Learning without limits
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// MAIN HOME PAGE - NO REDIRECTS
// ============================================
export default function Home() {
  const { data: session, status } = useSession()

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
      </div>
    )
  }

  // Authenticated user - Show Dashboard
  if (session) {
    return (
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    )
  }

  // Unauthenticated user - Show Landing Page
  return <LandingPage />
}
