"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/shared"
import { subjectNames, typeNames } from "@/lib/constants"

// ============================================
// TYPES
// ============================================
interface ReviewLog {
  id: string
  rating: number
  reviewedAt: string
  state: number
  elapsedDays: number
  scheduledDays: number
  resource: {
    id: string
    title: string
    author: string
    type: string
    subject: string
    thumbnail: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Rating display
const ratingConfig: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Again", color: "text-red-400", bg: "bg-red-500/20" },
  2: { label: "Hard", color: "text-amber-400", bg: "bg-amber-500/20" },
  3: { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  4: { label: "Easy", color: "text-blue-400", bg: "bg-blue-500/20" },
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ReviewHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [logs, setLogs] = useState<ReviewLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [ratingCounts, setRatingCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch history
  const fetchHistory = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/review/history?page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
        setRatingCounts(data.ratingCounts)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchHistory()
    }
  }, [session])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Total reviews
  const totalReviews = ratingCounts.again + ratingCounts.hard + ratingCounts.good + ratingCounts.easy

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
      <div className="p-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <nav className="flex gap-2 mb-4">
                <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Spaced Repetition</span>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ History</span>
              </nav>
              <h2 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
                Review <span className="text-accent-cyan">History</span>
              </h2>
              <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
                Track your learning progress and see how your memory improves over time.
              </p>
            </div>
            
            <Link href="/review" className="shrink-0">
              <button className="bg-accent-lime text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Continue Reviewing
              </button>
            </Link>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-[#0a0a0a] border border-white/10 p-5">
            <p className="font-serif text-3xl font-black text-white">{totalReviews}</p>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Total Reviews</p>
          </div>
          <div className="bg-[#0a0a0a] border border-red-500/20 p-5">
            <p className="font-serif text-3xl font-black text-red-400">{ratingCounts.again}</p>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Again</p>
          </div>
          <div className="bg-[#0a0a0a] border border-amber-500/20 p-5">
            <p className="font-serif text-3xl font-black text-amber-400">{ratingCounts.hard}</p>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Hard</p>
          </div>
          <div className="bg-[#0a0a0a] border border-emerald-500/20 p-5">
            <p className="font-serif text-3xl font-black text-emerald-400">{ratingCounts.good}</p>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Good</p>
          </div>
          <div className="bg-[#0a0a0a] border border-blue-500/20 p-5">
            <p className="font-serif text-3xl font-black text-blue-400">{ratingCounts.easy}</p>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Easy</p>
          </div>
        </div>

        {/* History List */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-500">history</span>
            </div>
            <h3 className="font-serif text-2xl font-black text-white italic mb-2">No Reviews Yet</h3>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest max-w-sm">
              Start reviewing your saved resources to build your learning history.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all p-4 flex items-center gap-4"
                >
                  {/* Rating Badge */}
                  <div className={`size-12 ${ratingConfig[log.rating].bg} flex items-center justify-center shrink-0`}>
                    <span className={`font-mono text-xs font-bold uppercase ${ratingConfig[log.rating].color}`}>
                      {ratingConfig[log.rating].label}
                    </span>
                  </div>

                  {/* Resource Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/resource/${log.resource.id}`} className="hover:text-accent-cyan transition-colors">
                      <p className="font-bold text-white truncate">{log.resource.title}</p>
                    </Link>
                    <p className="font-mono text-[10px] text-slate-500 flex items-center gap-2">
                      <span>{subjectNames[log.resource.subject]}</span>
                      <span>•</span>
                      <span>{typeNames[log.resource.type]}</span>
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-mono text-[10px] text-slate-500">{formatDate(log.reviewedAt)}</p>
                    <p className="font-mono text-[10px] text-slate-600">Interval: {log.scheduledDays.toFixed(1)}d</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => fetchHistory(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-white/20 font-mono text-xs uppercase text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 font-mono text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchHistory(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-white/20 font-mono text-xs uppercase text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
