"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Flame,
  TrendingUp,
  BookOpen,
  FileText,
  Video,
  Code,
  Calculator,
  FlaskConical,
  Languages,
  History,
  Briefcase,
  Sparkles,
  ArrowRight,
  Settings,
} from "lucide-react"
import { AppLayout } from "@/components/shared"
import { subjectNames, subjectGradients, typeNames, experienceNames, timeNames } from "@/lib/constants"

interface Stats {
  totalViews: number
  totalLikes: number
  totalDislikes: number
  totalSaved: number
  streak: number
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
}

const subjectIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  programming: Code,
  mathematics: Calculator,
  science: FlaskConical,
  languages: Languages,
  history: History,
  business: Briefcase,
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  article: FileText,
  video: Video,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-primary/20 text-primary text-xs font-semibold mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            Learning Insights
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Your <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Track your learning progress and discover patterns
          </p>
        </div>

        {/* Onboarding CTA */}
        {data && !data.hasCompletedOnboarding && (
          <Card className="glass-panel border-primary/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Complete your profile</h3>
                  <p className="text-sm text-slate-400">Set your preferences for better recommendations</p>
                </div>
                <Link href="/onboarding">
                  <Button className="accent-gradient shadow-lg shadow-primary/30 gap-2">
                    Set Preferences
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="glass-panel border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data?.stats.totalViews || 0}</p>
                  <p className="text-xs text-slate-400">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data?.stats.totalLikes || 0}</p>
                  <p className="text-xs text-slate-400">Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data?.stats.totalDislikes || 0}</p>
                  <p className="text-xs text-slate-400">Dislikes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data?.stats.totalSaved ?? 0}</p>
                  <p className="text-xs text-slate-400">Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data?.stats.streak || 0}</p>
                  <p className="text-xs text-slate-400">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Distribution */}
          <Card className="glass-panel border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Subject Interactions</h3>
              </div>
              <div className="space-y-3">
                {data?.subjectDistribution && Object.entries(data.subjectDistribution).length > 0 ? (
                  Object.entries(data.subjectDistribution).map(([subject, count]) => {
                    const Icon = subjectIcons[subject]
                    const percentage = Math.round((count / maxSubjectCount) * 100)
                    return (
                      <div key={subject} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${subjectGradients[subject]}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{subjectNames[subject]}</span>
                            <span className="text-white font-medium">{count}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${subjectGradients[subject]} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-slate-400 text-center py-4">No interactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card className="glass-panel border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Resource Types</h3>
              </div>
              <div className="space-y-3">
                {data?.typeDistribution && Object.entries(data.typeDistribution).length > 0 ? (
                  Object.entries(data.typeDistribution).map(([type, count]) => {
                    const Icon = typeIcons[type]
                    const percentage = Math.round((count / maxTypeCount) * 100)
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{typeNames[type]}</span>
                            <span className="text-white font-medium">{count}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-slate-400 text-center py-4">No interactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Profile */}
          <Card className="glass-panel border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Learning Profile</h3>
              </div>
              
              <div className="space-y-4">
                {/* Experience Level */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Experience Level</p>
                  <p className="text-white font-medium">{experienceNames[data?.experienceLevel || "beginner"]}</p>
                </div>

                {/* Time Commitment */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time Commitment</p>
                  <p className="text-white font-medium">{timeNames[data?.timeCommitment || "casual"]}</p>
                </div>

                {/* Preferred Subjects */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preferred Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {data?.preferredSubjects && data.preferredSubjects.length > 0 ? (
                      data.preferredSubjects.map((subject) => (
                        <span
                          key={subject}
                          className={`px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${subjectGradients[subject]} text-white`}
                        >
                          {subjectNames[subject]}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">Not set</span>
                    )}
                  </div>
                </div>

                {/* Preferred Formats */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preferred Formats</p>
                  <div className="flex flex-wrap gap-2">
                    {data?.preferredFormats && data.preferredFormats.length > 0 ? (
                      data.preferredFormats.map((format) => {
                        const Icon = typeIcons[format === "books" ? "book" : format === "articles" ? "article" : "video"]
                        return (
                          <span
                            key={format}
                            className="px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary flex items-center gap-1"
                          >
                            <Icon className="w-3 h-3" />
                            {format.charAt(0).toUpperCase() + format.slice(1)}
                          </span>
                        )
                      })
                    ) : (
                      <span className="text-slate-400 text-sm">Not set</span>
                    )}
                  </div>
                </div>

                <Link href="/onboarding" className="block mt-4">
                  <Button variant="outline" className="w-full border-white/10 text-slate-300">
                    Edit Preferences
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {data?.recentResources && data.recentResources.length > 0 && (
          <Card className="glass-panel border-white/5 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">Recent Activity</h3>
                </div>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {data.recentResources.map((resource) => {
                  const TypeIcon = typeIcons[resource.type]
                  return (
                    <Link key={resource.id} href={`/resource/${resource.id}`}>
                      <div className="glass-panel rounded-xl p-3 hover:border-primary/30 transition-all">
                        <div className={`w-full aspect-video rounded-lg flex items-center justify-center mb-2 ${
                          resource.thumbnail ? "" : "bg-gradient-to-br " + subjectGradients[resource.subject]
                        }`}>
                          {resource.thumbnail ? (
                            <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <TypeIcon className="w-8 h-8 text-white/80" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-white line-clamp-2">{resource.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{subjectNames[resource.subject]}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
