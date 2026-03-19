"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Mail,
  Calendar,
  Settings,
  BookOpen,
  ThumbsUp,
  Bookmark,
  Eye,
  Flame,
  ArrowRight,
  Edit,
  Code,
  Calculator,
  FlaskConical,
  Languages,
  History,
  Briefcase,
} from "lucide-react"
import { AppLayout } from "@/components/shared"
import { subjectNames, subjectGradients, experienceNames, timeNames } from "@/lib/constants"

interface ProfileData {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  profile: {
    subjects: string[]
    formats: string[]
    experienceLevel: string
    timeCommitment: string
    onboardingCompleted: boolean
  } | null
  stats: {
    views: number
    likes: number
    saved: number
  }
}

const subjectIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  programming: Code,
  mathematics: Calculator,
  science: FlaskConical,
  languages: Languages,
  history: History,
  business: Briefcase,
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const profileData = await response.json()
          setData(profileData)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    )
  }

  const user = data?.user
  const profile = data?.profile
  const stats = data?.stats

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-primary/20 text-primary text-xs font-semibold mb-4">
            <User className="w-3.5 h-3.5" />
            Your Account
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Manage your account and learning preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glass-panel border-white/5 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="w-24 h-24 accent-gradient text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
              </div>
              <Link href="/onboarding">
                <Button variant="outline" className="border-white/10 text-slate-300">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-panel border-white/5">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.views || 0}</p>
              <p className="text-xs text-slate-400">Resources Viewed</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <ThumbsUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.likes || 0}</p>
              <p className="text-xs text-slate-400">Liked</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.saved || 0}</p>
              <p className="text-xs text-slate-400">Saved</p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white">{profile?.experienceLevel ? experienceNames[profile.experienceLevel] : "Beginner"}</p>
              <p className="text-xs text-slate-400">Level</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Profile */}
        <Card className="glass-panel border-white/5 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Learning Profile</h3>
              </div>
              {!profile?.onboardingCompleted && (
                <Link href="/onboarding">
                  <Button size="sm" className="accent-gradient shadow-lg shadow-primary/30 gap-2">
                    Complete Setup
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Level */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Experience Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-white font-medium">
                    {profile?.experienceLevel ? experienceNames[profile.experienceLevel] : "Not set"}
                  </span>
                </div>
              </div>

              {/* Time Commitment */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Time Commitment</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-white font-medium">
                    {profile?.timeCommitment ? timeNames[profile.timeCommitment] : "Not set"}
                  </span>
                </div>
              </div>

              {/* Preferred Subjects */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preferred Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.subjects && profile.subjects.length > 0 ? (
                    profile.subjects.map((subject) => {
                      const Icon = subjectIcons[subject]
                      return (
                        <span
                          key={subject}
                          className={`px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${subjectGradients[subject]} text-white flex items-center gap-1`}
                        >
                          <Icon className="w-3 h-3" />
                          {subjectNames[subject]}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-slate-400 text-sm">Not set</span>
                  )}
                </div>
              </div>

              {/* Preferred Formats */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preferred Formats</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.formats && profile.formats.length > 0 ? (
                    profile.formats.map((format) => (
                      <span
                        key={format}
                        className="px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary"
                      >
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-panel border-white/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/saved">
                <Button variant="outline" className="w-full border-white/10 text-slate-300 justify-start">
                  <Bookmark className="w-4 h-4 mr-2" />
                  View Saved Resources
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full border-white/10 text-slate-300 justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/for-you">
                <Button variant="outline" className="w-full border-white/10 text-slate-300 justify-start">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Get Recommendations
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="outline" className="w-full border-white/10 text-slate-300 justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Preferences
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
