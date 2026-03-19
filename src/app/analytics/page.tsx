"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AppLayout } from "@/components/shared"
import { subjectNames, typeNames, experienceNames, timeNames } from "@/lib/constants"

interface Stats {
  totalViews: number
  totalLikes: number
  totalDislikes: number
  totalSaved: number
  streak: number
}

interface ReviewStats {
  totalCards: number
  cardsDueToday: number
  totalReviews: number
  reviewsToday: number
  reviewsThisWeek: number
  retentionRate: number
  ratingDistribution: {
    again: number
    hard: number
    good: number
    easy: number
  }
}

interface AnalyticsData {
  stats: Stats
  subjectDistribution: Record<string, number>
  typeDistribution: Record<string, number>
  preferredSubjects: string[]
  preferredFormats: string[]
  likedSubjectCounts: Record<string, number>
  experienceLevel: string
  timeCommitment: string
  hasCompletedOnboarding: boolean
  recentResources: Array<{
    id: string
    title: string
    type: string
    subject: string
    thumbnail: string | null
    viewedAt: string
  }>
  reviewStats: ReviewStats
}

// Material Symbols for subjects
const subjectIcons: Record<string, string> = {
  programming: "code",
  mathematics: "calculate",
  science: "science",
  languages: "translate",
  history: "history_edu",
  business: "business_center",
}

// Material Symbols for types
const typeIcons: Record<string, string> = {
  book: "menu_book",
  article: "article",
  video: "play_circle",
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/analytics")
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchAnalytics()
    }
  }, [session])

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-2 border-accent-cyan border-t-transparent animate-spin" />
            <p className="text-mono text-xs uppercase tracking-widest text-accent-cyan">Loading analytics...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const maxSubjectCount = data?.subjectDistribution
    ? Math.max(...Object.values(data.subjectDistribution), 1)
    : 1

  const maxTypeCount = data?.typeDistribution
    ? Math.max(...Object.values(data.typeDistribution), 1)
    : 1

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="mb-12">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="tag-cyan flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">insights</span>
              Learning Insights
            </span>
          </div>
          
          {/* Headline - Serif italic */}
          <h1 className="text-serif text-7xl md:text-8xl font-bold italic tracking-tighter mb-4">
            <span className="text-white">Your </span>
            <span className="text-accent-cyan text-glow-cyan">Analytics</span>
          </h1>
          
          <p className="text-mono text-xs uppercase tracking-widest text-slate-400 max-w-xl">
            Track your learning progress and discover patterns in your educational journey
          </p>
        </div>

        {/* Onboarding CTA */}
        {data && !data.hasCompletedOnboarding && (
          <div className="glass-panel p-6 mb-8 border-l-4 border-l-accent-lime relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lime/5 blur-3xl" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-14 h-14 bg-accent-lime flex items-center justify-center shadow-brutalist-cyan shrink-0">
                <span className="material-symbols-outlined text-black text-2xl">tune</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">Complete your profile</h3>
                <p className="text-slate-400 text-sm mt-1">Set your preferences for better recommendations</p>
              </div>
              <Link 
                href="/onboarding"
                className="btn-brutalist"
              >
                Set Preferences
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {/* Views Card */}
          <div className="card-brutalist p-5 group hover:border-accent-cyan/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent-cyan">visibility</span>
              </div>
              <span className="tag-cyan">Views</span>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">{data?.stats.totalViews || 0}</p>
            <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mt-2">Resources Viewed</p>
          </div>

          {/* Likes Card */}
          <div className="card-brutalist p-5 group hover:border-accent-lime/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent-lime/10 border border-accent-lime/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent-lime">thumb_up</span>
              </div>
              <span className="tag-lime">Likes</span>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">{data?.stats.totalLikes || 0}</p>
            <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mt-2">Resources Liked</p>
          </div>

          {/* Saved Card */}
          <div className="card-brutalist p-5 group hover:border-accent-cyan/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent-cyan">bookmark</span>
              </div>
              <span className="tag-cyan">Saved</span>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">{data?.stats.totalSaved ?? 0}</p>
            <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mt-2">Resources Saved</p>
          </div>

          {/* Subjects Card */}
          <div className="card-brutalist p-5 group hover:border-accent-lime/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent-lime/10 border border-accent-lime/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent-lime">explore</span>
              </div>
              <span className="tag-lime">Subjects</span>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">
              {data?.subjectDistribution ? Object.keys(data.subjectDistribution).length : 0}
            </p>
            <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mt-2">Subjects Explored</p>
          </div>

          {/* Streak Card */}
          <div className="card-brutalist p-5 group hover:border-accent-cyan/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/10 blur-2xl" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-400 filled">local_fire_department</span>
              </div>
              <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 font-mono text-[9px] uppercase tracking-wider px-2 py-1">Streak</span>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight relative z-10">{data?.stats.streak || 0}</p>
            <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mt-2 relative z-10">Day Streak</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Subject Distribution Chart */}
          <div className="card-brutalist p-6 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-lime flex items-center justify-center shadow-brutalist-cyan">
                <span className="material-symbols-outlined text-black">bar_chart</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Subject Interactions</h3>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">By category</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {data?.subjectDistribution && Object.entries(data.subjectDistribution).length > 0 ? (
                Object.entries(data.subjectDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([subject, count]) => {
                    const percentage = Math.round((count / maxSubjectCount) * 100)
                    return (
                      <div key={subject} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-accent-cyan">
                              {subjectIcons[subject]}
                            </span>
                            <span className="text-sm text-slate-300">{subjectNames[subject]}</span>
                          </div>
                          <span className="text-mono text-sm font-bold text-white">{count}</span>
                        </div>
                        <div className="h-2 bg-white/5 border border-white/10 overflow-hidden">
                          <div
                            className="h-full bg-accent-cyan transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-600 block mb-3">pie_chart</span>
                  <p className="text-mono text-xs uppercase tracking-widest text-slate-500">No interactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Resource Types Chart */}
          <div className="card-brutalist p-6 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-cyan flex items-center justify-center shadow-brutalist-lime">
                <span className="material-symbols-outlined text-black">category</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Resource Types</h3>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Format breakdown</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {data?.typeDistribution && Object.entries(data.typeDistribution).length > 0 ? (
                Object.entries(data.typeDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const percentage = Math.round((count / maxTypeCount) * 100)
                    return (
                      <div key={type} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-accent-lime">
                              {typeIcons[type]}
                            </span>
                            <span className="text-sm text-slate-300">{typeNames[type]}</span>
                          </div>
                          <span className="text-mono text-sm font-bold text-white">{count}</span>
                        </div>
                        <div className="h-2 bg-white/5 border border-white/10 overflow-hidden">
                          <div
                            className="h-full bg-accent-lime transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-600 block mb-3">donut_large</span>
                  <p className="text-mono text-xs uppercase tracking-widest text-slate-500">No interactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Learning Profile Card */}
          <div className="card-brutalist p-6 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-accent-cyan flex items-center justify-center shadow-brutalist-cyan">
                <span className="material-symbols-outlined text-accent-cyan">person</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Learning Profile</h3>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Your preferences</p>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Experience Level */}
              <div>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Experience Level</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-accent-cyan">
                      {data?.experienceLevel === "beginner" ? "school" : data?.experienceLevel === "intermediate" ? "trending_up" : "rocket_launch"}
                    </span>
                  </div>
                  <p className="text-white font-bold">{experienceNames[data?.experienceLevel || "beginner"]}</p>
                </div>
              </div>

              {/* Time Commitment */}
              <div>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Time Commitment</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-lime/10 border border-accent-lime/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-accent-lime">
                      {data?.timeCommitment === "casual" ? "speed" : data?.timeCommitment === "moderate" ? "schedule" : "all_inclusive"}
                    </span>
                  </div>
                  <p className="text-white font-bold">{timeNames[data?.timeCommitment || "casual"]}</p>
                </div>
              </div>

              {/* Preferred Subjects */}
              <div>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Preferred Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {data?.preferredSubjects && data.preferredSubjects.length > 0 ? (
                    data.preferredSubjects.map((subject) => (
                      <span key={subject} className="tag-cyan">
                        {subjectNames[subject]}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">Not set</span>
                  )}
                </div>
              </div>

              {/* Preferred Formats */}
              <div>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Preferred Formats</p>
                <div className="flex flex-wrap gap-2">
                  {data?.preferredFormats && data.preferredFormats.length > 0 ? (
                    data.preferredFormats.map((format) => (
                      <span key={format} className="tag-lime">
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">Not set</span>
                  )}
                </div>
              </div>

              <Link href="/onboarding" className="block mt-4">
                <button className="btn-brutalist-outline w-full">
                  <span className="material-symbols-outlined text-sm mr-2">edit</span>
                  Edit Preferences
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Learning Progress Indicators */}
        <div className="card-brutalist p-6 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-lime flex items-center justify-center shadow-brutalist-cyan">
              <span className="material-symbols-outlined text-black">trending_up</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Learning Progress</h3>
              <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Your growth metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Engagement Score */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Engagement Score</p>
                <span className="material-symbols-outlined text-accent-cyan text-sm">insights</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {Math.round(((data?.stats.totalViews || 0) + (data?.stats.totalLikes || 0) * 2 + (data?.stats.totalSaved || 0) * 3) / 10) * 10}
              </p>
              <div className="h-1.5 bg-white/5 border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-lime"
                  style={{ width: `${Math.min(100, ((data?.stats.totalViews || 0) + (data?.stats.totalLikes || 0) * 2 + (data?.stats.totalSaved || 0) * 3) / 5)}%` }}
                />
              </div>
            </div>

            {/* Like Rate */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Like Rate</p>
                <span className="material-symbols-outlined text-accent-lime text-sm">thumb_up</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {data?.stats.totalViews && data.stats.totalViews > 0 
                  ? Math.round((data.stats.totalLikes / data.stats.totalViews) * 100) 
                  : 0}%
              </p>
              <div className="h-1.5 bg-white/5 border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-accent-lime"
                  style={{ width: `${data?.stats.totalViews && data.stats.totalViews > 0 
                    ? Math.round((data.stats.totalLikes / data.stats.totalViews) * 100) 
                    : 0}%` }}
                />
              </div>
            </div>

            {/* Save Rate */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Save Rate</p>
                <span className="material-symbols-outlined text-accent-cyan text-sm">bookmark</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {data?.stats.totalViews && data.stats.totalViews > 0 
                  ? Math.round((data.stats.totalSaved / data.stats.totalViews) * 100) 
                  : 0}%
              </p>
              <div className="h-1.5 bg-white/5 border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-accent-cyan"
                  style={{ width: `${data?.stats.totalViews && data.stats.totalViews > 0 
                    ? Math.round((data.stats.totalSaved / data.stats.totalViews) * 100) 
                    : 0}%` }}
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Activity Level</p>
                <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {(data?.stats.streak || 0) >= 7 ? "Active" : (data?.stats.streak || 0) >= 3 ? "Warming" : "New"}
              </p>
              <div className="h-1.5 bg-white/5 border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ width: `${Math.min(100, (data?.stats.streak || 0) * 14)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spaced Repetition Stats */}
        <div className="card-brutalist p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-lime flex items-center justify-center shadow-brutalist-cyan">
                <span className="material-symbols-outlined text-black">fact_check</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Review Stats</h3>
                <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Spaced repetition progress</p>
              </div>
            </div>
            <Link 
              href="/review"
              className="flex items-center gap-2 text-mono text-xs uppercase tracking-widest text-slate-400 hover:text-accent-cyan transition-colors"
            >
              Review Now
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Cards */}
            <div className="glass-panel p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-accent-cyan">library_books</span>
              </div>
              <p className="text-2xl font-bold text-white">{data?.reviewStats?.totalCards || 0}</p>
              <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">Total Cards</p>
            </div>

            {/* Due Today */}
            <div className="glass-panel p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-accent-lime/10 border border-accent-lime/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-accent-lime">schedule</span>
              </div>
              <p className="text-2xl font-bold text-white">{data?.reviewStats?.cardsDueToday || 0}</p>
              <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">Due Today</p>
            </div>

            {/* Reviews Today */}
            <div className="glass-panel p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-purple-400">today</span>
              </div>
              <p className="text-2xl font-bold text-white">{data?.reviewStats?.reviewsToday || 0}</p>
              <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">Reviews Today</p>
            </div>

            {/* This Week */}
            <div className="glass-panel p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-teal-400">date_range</span>
              </div>
              <p className="text-2xl font-bold text-white">{data?.reviewStats?.reviewsThisWeek || 0}</p>
              <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">This Week</p>
            </div>

            {/* Retention Rate */}
            <div className="glass-panel p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-amber-400">trending_up</span>
              </div>
              <p className="text-2xl font-bold text-white">{data?.reviewStats?.retentionRate || 0}%</p>
              <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">Retention</p>
            </div>

            {/* Total Reviews */}
            <div className="glass-panel p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-rose-400">workspace_premium</span>
              </div>
              <p className="text-2xl font-bold text-white">{data?.reviewStats?.totalReviews || 0}</p>
              <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">All Time</p>
            </div>
          </div>

          {/* Rating Distribution */}
          {data?.reviewStats && data.reviewStats.totalReviews > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Rating Distribution</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-16 bg-white/5 border border-white/10 flex items-end justify-center overflow-hidden">
                    <div 
                      className="w-full bg-red-500 transition-all duration-500"
                      style={{ 
                        height: `${data.reviewStats.totalReviews > 0 
                          ? (data.reviewStats.ratingDistribution.again / data.reviewStats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-mono text-lg font-bold text-red-400 mt-2">{data.reviewStats.ratingDistribution.again}</p>
                  <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500">Again</p>
                </div>
                <div className="text-center">
                  <div className="h-16 bg-white/5 border border-white/10 flex items-end justify-center overflow-hidden">
                    <div 
                      className="w-full bg-amber-500 transition-all duration-500"
                      style={{ 
                        height: `${data.reviewStats.totalReviews > 0 
                          ? (data.reviewStats.ratingDistribution.hard / data.reviewStats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-mono text-lg font-bold text-amber-400 mt-2">{data.reviewStats.ratingDistribution.hard}</p>
                  <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500">Hard</p>
                </div>
                <div className="text-center">
                  <div className="h-16 bg-white/5 border border-white/10 flex items-end justify-center overflow-hidden">
                    <div 
                      className="w-full bg-emerald-500 transition-all duration-500"
                      style={{ 
                        height: `${data.reviewStats.totalReviews > 0 
                          ? (data.reviewStats.ratingDistribution.good / data.reviewStats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-mono text-lg font-bold text-emerald-400 mt-2">{data.reviewStats.ratingDistribution.good}</p>
                  <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500">Good</p>
                </div>
                <div className="text-center">
                  <div className="h-16 bg-white/5 border border-white/10 flex items-end justify-center overflow-hidden">
                    <div 
                      className="w-full bg-blue-500 transition-all duration-500"
                      style={{ 
                        height: `${data.reviewStats.totalReviews > 0 
                          ? (data.reviewStats.ratingDistribution.easy / data.reviewStats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-mono text-lg font-bold text-blue-400 mt-2">{data.reviewStats.ratingDistribution.easy}</p>
                  <p className="text-mono text-[9px] uppercase tracking-widest text-slate-500">Easy</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!data?.reviewStats?.totalCards || data.reviewStats.totalCards === 0) && (
            <div className="mt-6 p-6 border border-white/5 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600 block mb-3">fact_check</span>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                Save resources to start building your review queue!
              </p>
              <Link href="/browse" className="inline-block mt-4">
                <button className="bg-accent-lime text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_#00FFFF] hover:bg-white transition-colors">
                  Browse Resources
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {data?.recentResources && data.recentResources.length > 0 && (
          <div className="card-brutalist p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-accent-lime flex items-center justify-center shadow-brutalist-lime">
                  <span className="material-symbols-outlined text-accent-lime">history</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Recent Activity</h3>
                  <p className="text-mono text-[10px] uppercase tracking-widest text-slate-500">Recently viewed resources</p>
                </div>
              </div>
              <Link 
                href="/"
                className="flex items-center gap-2 text-mono text-xs uppercase tracking-widest text-slate-400 hover:text-accent-cyan transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.recentResources.map((resource) => (
                <Link key={resource.id} href={`/resource/${resource.id}`}>
                  <div className="glass-panel p-4 group hover:border-accent-cyan/50 transition-all duration-300 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-white/5 border border-white/10 mb-3 overflow-hidden flex items-center justify-center">
                      {resource.thumbnail ? (
                        <Image 
                          src={resource.thumbnail} 
                          alt={`Thumbnail preview for recently viewed resource: ${resource.title}`} 
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-slate-600">
                          {typeIcons[resource.type]}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent-cyan transition-colors mb-2">
                      {resource.title}
                    </p>
                    
                    {/* Meta */}
                    <div className="flex items-center justify-between">
                      <span className="tag-cyan">{subjectNames[resource.subject]}</span>
                      <span className="material-symbols-outlined text-sm text-slate-500">
                        {typeIcons[resource.type]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!data?.recentResources || data.recentResources.length === 0) && (
          <div className="card-brutalist p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-600 block mb-4">auto_stories</span>
            <h3 className="text-white font-bold text-xl mb-2">Start Your Learning Journey</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Browse resources and start learning to see your analytics here
            </p>
            <Link href="/" className="btn-brutalist inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">explore</span>
              Browse Resources
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
