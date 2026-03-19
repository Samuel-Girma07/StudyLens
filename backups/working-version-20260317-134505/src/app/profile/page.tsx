"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { AppLayout } from "@/components/shared"
import { subjectNames, experienceNames, timeNames, formatNames } from "@/lib/constants"

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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

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
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  const user = data?.user
  const profile = data?.profile
  const stats = data?.stats

  const handleSignOut = () => {
    setIsSigningOut(true)
    signOut({ callbackUrl: "/" })
  }

  return (
    <AppLayout>
      <div className="flex-1 p-8 overflow-y-auto scrollbar-brutalist">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan mb-3">
              Account Settings
            </p>
            <h1 className="text-serif text-7xl sm:text-8xl font-black italic tracking-tighter leading-none">
              <span className="text-accent-cyan">Pro</span>
              <span className="text-white">file</span>
            </h1>
          </div>

          {/* User Info Card */}
          <div className="glass-panel p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="size-24 bg-accent-cyan flex items-center justify-center shadow-[4px_4px_0px_#CCFF00] shrink-0">
                <span className="material-symbols-outlined text-4xl text-black filled">person</span>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                  {user?.name || "User"}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <span className="material-symbols-outlined text-sm text-accent-cyan">mail</span>
                  <span className="font-mono text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm text-accent-lime">calendar_month</span>
                  <span className="font-mono text-xs">Member since {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
              </div>

              {/* Edit Button */}
              <Link href="/onboarding" className="shrink-0">
                <button className="btn-brutalist flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Preferences
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Views Stat */}
            <div className="glass-panel p-5 border-l-4 border-accent-cyan">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-accent-cyan text-xl">visibility</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Viewed</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.views || 0}</p>
            </div>

            {/* Likes Stat */}
            <div className="glass-panel p-5 border-l-4 border-accent-lime">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-accent-lime text-xl">thumb_up</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Liked</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.likes || 0}</p>
            </div>

            {/* Saved Stat */}
            <div className="glass-panel p-5 border-l-4 border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-white text-xl">bookmark</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Saved</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.saved || 0}</p>
            </div>
          </div>

          {/* Learning Preferences Section */}
          <div className="glass-panel p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-accent-cyan text-xl">tune</span>
              <h3 className="text-lg font-bold text-white">Learning Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Level */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                  Experience Level
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-accent-lime/10 flex items-center justify-center border border-accent-lime/30">
                    <span className="material-symbols-outlined text-accent-lime">school</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {profile?.experienceLevel ? experienceNames[profile.experienceLevel] : "Not set"}
                  </span>
                </div>
              </div>

              {/* Time Commitment */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                  Time Commitment
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/30">
                    <span className="material-symbols-outlined text-accent-cyan">schedule</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {profile?.timeCommitment ? timeNames[profile.timeCommitment] : "Not set"}
                  </span>
                </div>
              </div>

              {/* Selected Subjects */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                  Selected Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile?.subjects && profile.subjects.length > 0 ? (
                    profile.subjects.map((subject) => (
                      <span key={subject} className="tag-cyan">
                        {subjectNames[subject]}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm font-mono">Not configured</span>
                  )}
                </div>
              </div>

              {/* Preferred Formats */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                  Preferred Formats
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile?.formats && profile.formats.length > 0 ? (
                    profile.formats.map((format) => (
                      <span key={format} className="tag-lime">
                        {formatNames[format]}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm font-mono">Not configured</span>
                  )}
                </div>
              </div>
            </div>

            {/* Onboarding Status */}
            {profile && !profile.onboardingCompleted && (
              <div className="mt-6 p-4 border border-accent-lime/30 bg-accent-lime/5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent-lime">warning</span>
                  <div>
                    <p className="text-white font-bold text-sm">Profile Incomplete</p>
                    <p className="text-slate-400 text-sm">Complete your preferences to get personalized recommendations</p>
                  </div>
                  <Link href="/onboarding" className="ml-auto">
                    <button className="btn-brutalist text-xs py-2 px-4">
                      Complete Setup
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="glass-panel p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-accent-lime text-xl">link</span>
              <h3 className="text-lg font-bold text-white">Quick Links</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/saved" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-cyan">bookmark</span>
                    <span className="font-mono text-sm text-white group-hover:text-accent-cyan transition-colors">Saved Resources</span>
                  </div>
                </div>
              </Link>

              <Link href="/analytics" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-lime/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-lime">insights</span>
                    <span className="font-mono text-sm text-white group-hover:text-accent-lime transition-colors">Analytics</span>
                  </div>
                </div>
              </Link>

              <Link href="/for-you" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-cyan">auto_awesome</span>
                    <span className="font-mono text-sm text-white group-hover:text-accent-cyan transition-colors">Recommendations</span>
                  </div>
                </div>
              </Link>

              <Link href="/onboarding" className="group">
                <div className="p-4 border border-white/10 hover:border-accent-lime/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-lime">settings</span>
                    <span className="font-mono text-sm text-white group-hover:text-accent-lime transition-colors">Edit Preferences</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400 text-xl">logout</span>
                <div>
                  <p className="text-white font-bold">Sign Out</p>
                  <p className="text-slate-500 text-sm font-mono">End your current session</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="btn-brutalist-outline border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSigningOut ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
