"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AppLayout } from "@/components/shared"
import { subjectNames, typeNames, subjectGradients } from "@/lib/constants"
import { formatNextReview, CardState } from "@/lib/fsrs"

// ============================================
// TYPES
// ============================================
interface ReviewCard {
  id: string
  resourceId: string
  title: string
  description: string
  author: string
  type: string
  subject: string
  thumbnail: string | null
  url: string
  difficulty: string
  tags: string[]
  due: string
  stability: number
  difficulty_score: number
  state: number
  reps: number
  lapses: number
  lastReview: string | null
  scheduledDays: number
}

interface Stats {
  total: number
  dueToday: number
  new: number
  learning: number
  review: number
  retentionRate: number
  reviewedToday: number
}

// ============================================
// RATING CONFIGURATION
// ============================================
const ratingLabels = {
  1: { label: "Again", color: "bg-red-500", description: "Forgot completely" },
  2: { label: "Hard", color: "bg-amber-500", description: "Remembered with difficulty" },
  3: { label: "Good", color: "bg-emerald-500", description: "Remembered correctly" },
  4: { label: "Easy", color: "bg-blue-500", description: "Remembered instantly" },
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [intervals, setIntervals] = useState<Record<number, string>>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch due cards
  const fetchCards = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/review")
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
        setStats(data.stats)
        
        // Calculate intervals for each rating for the first card
        if (data.cards.length > 0) {
          calculateIntervals(data.cards[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error)
      toast.error("Failed to load review cards")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchCards()
    }
  }, [session, fetchCards])

  // Calculate intervals for rating buttons
  const calculateIntervals = (card: ReviewCard) => {
    // Simple interval calculation based on state
    // New cards: Again=1min, Hard=10min, Good=1day, Easy=4days
    // Learning: varies by step
    // Review: based on stability
    
    let intervals: Record<number, string> = {}
    
    if (card.state === CardState.New) {
      intervals[1] = "<1 min"
      intervals[2] = "10 min"
      intervals[3] = "1 day"
      intervals[4] = "4 days"
    } else if (card.state === CardState.Learning || card.state === CardState.Relearning) {
      intervals[1] = "<1 min"
      intervals[2] = "10 min"
      intervals[3] = "1 day"
      intervals[4] = "2 days"
    } else {
      // Review state - intervals based on current scheduling
      intervals[1] = "<1 day"
      intervals[2] = formatNextReview(new Date(Date.now() + card.scheduledDays * 0.5 * 24 * 60 * 60 * 1000))
      intervals[3] = formatNextReview(new Date(Date.now() + card.scheduledDays * 24 * 60 * 60 * 1000))
      intervals[4] = formatNextReview(new Date(Date.now() + card.scheduledDays * 2 * 24 * 60 * 60 * 1000))
    }
    
    setIntervals(intervals)
  }

  // Handle rating submission
  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (cards.length === 0 || !cards[currentIndex]) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/review/${cards[currentIndex].id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })
      
      if (response.ok) {
        // Move to next card
        const nextIndex = currentIndex + 1
        if (nextIndex < cards.length) {
          setCurrentIndex(nextIndex)
          setShowAnswer(false)
          calculateIntervals(cards[nextIndex])
        } else {
          // All cards reviewed
          setCards([])
          setCurrentIndex(0)
          toast.success("All cards reviewed! Great job! 🎉")
          // Refresh stats
          fetchCards()
        }
      } else {
        toast.error("Failed to submit review")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get current card
  const currentCard = cards[currentIndex]

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-6">
            <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest text-accent-cyan">Loading review cards...</p>
          </div>
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
                <span className="font-mono text-[10px] text-accent-lime uppercase tracking-tighter bg-accent-lime/10 px-2 py-1 italic">Spaced Repetition</span>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Review</span>
              </nav>
              <h2 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
                Review <span className="text-accent-lime">Inbox</span>
              </h2>
              <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-cyan pl-6 py-2">
                Spaced repetition helps you remember what you learn. Review cards when they&apos;re due for maximum retention.
              </p>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="flex gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 p-4 text-center">
                  <p className="text-serif text-3xl font-black text-white">{stats.dueToday}</p>
                  <p className="font-mono text-[10px] text-slate-500 uppercase">Due Today</p>
                </div>
                <div className="bg-[#0a0a0a] border border-accent-lime/20 p-4 text-center">
                  <p className="text-serif text-3xl font-black text-accent-lime">{stats.retentionRate}%</p>
                  <p className="font-mono text-[10px] text-slate-500 uppercase">Retention</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Empty State */}
        {!isLoading && cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="size-32 bg-accent-lime/5 border-2 border-dashed border-accent-lime flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-accent-lime font-thin">check_circle</span>
              </div>
            </div>
            <h3 className="font-serif text-4xl font-black text-white italic mb-2">All Caught Up!</h3>
            <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm mb-8">
              No cards due for review. Save resources to add them to your review queue.
            </p>
            <Link href="/browse">
              <button className="bg-accent-lime text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all">
                Browse Resources
              </button>
            </Link>
          </div>
        )}

        {/* Review Card */}
        {!isLoading && cards.length > 0 && currentCard && (
          <div className="max-w-4xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <span className="font-mono text-xs text-accent-cyan">
                  {Math.round(((currentIndex) / cards.length) * 100)}% complete
                </span>
              </div>
              <div className="h-1 bg-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-lime transition-all duration-300"
                  style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="tag-cyan">{subjectNames[currentCard.subject]}</span>
                  <span className="tag-lime">{typeNames[currentCard.type]}</span>
                  {currentCard.state === CardState.New && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 font-mono text-[9px] uppercase">New</span>
                  )}
                  {currentCard.lapses > 0 && (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 font-mono text-[9px] uppercase">
                      {currentCard.lapses} lapse{currentCard.lapses > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-2">
                  {currentCard.title}
                </h3>
                <p className="font-mono text-xs text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">person</span>
                  {currentCard.author}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Thumbnail */}
                {currentCard.thumbnail && (
                  <div className="mb-6">
                    <img 
                      src={currentCard.thumbnail} 
                      alt={currentCard.title}
                      className="w-full max-h-48 object-cover border border-white/10"
                    />
                  </div>
                )}

                {/* Description (hidden until "Show Answer") */}
                <div className={`transition-all duration-300 ${showAnswer ? "opacity-100" : "opacity-50 blur-sm"}`}>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {currentCard.description}
                  </p>
                  
                  {/* Tags */}
                  {currentCard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {currentCard.tags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="bg-white/5 text-slate-400 px-2 py-1 font-mono text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Show Answer Button */}
                {!showAnswer && (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-4 bg-white/5 border border-white/20 font-mono text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Show Answer
                  </button>
                )}

                {/* Rating Buttons */}
                {showAnswer && (
                  <div className="space-y-4">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest text-center mb-4">
                      How well did you remember this?
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {([1, 2, 3, 4] as const).map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRate(rating)}
                          disabled={isSubmitting}
                          className={`p-4 border transition-all flex flex-col items-center gap-2 ${
                            isSubmitting 
                              ? "opacity-50 cursor-not-allowed" 
                              : "hover:border-white/30 hover:bg-white/5"
                          }`}
                        >
                          <div className={`size-8 ${ratingLabels[rating].color} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-sm">
                              {rating === 1 ? "refresh" : rating === 2 ? "thumb_down" : rating === 3 ? "thumb_up" : "bolt"}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold uppercase text-white">
                            {ratingLabels[rating].label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {intervals[rating] || "—"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Open Resource Link */}
                {showAnswer && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <a
                      href={currentCard.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 text-accent-cyan hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span className="font-mono text-xs uppercase tracking-widest">Open Full Resource</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between items-center">
              <Link href="/saved" className="font-mono text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">bookmark</span>
                View Saved Resources
              </Link>
              <Link href="/review/history" className="font-mono text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">history</span>
                Review History
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
