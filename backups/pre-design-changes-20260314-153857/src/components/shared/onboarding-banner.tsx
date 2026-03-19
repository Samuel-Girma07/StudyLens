"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, X } from "lucide-react"

const DISMISSAL_EXPIRY_DAYS = 7

export function OnboardingBanner() {
  const { data: session } = useSession()
  const [showBanner, setShowBanner] = useState(false)
  // Use lazy initializer to get dismissed state from localStorage
  const [dismissed, setDismissed] = useState(() => {
    // Only runs once on mount
    if (typeof window === "undefined") return false
    const expiryStr = localStorage.getItem("onboarding-banner-dismissed")
    if (!expiryStr) return false
    
    // Check if the dismissal has expired
    const expiryDate = new Date(expiryStr)
    if (isNaN(expiryDate.getTime())) return false
    
    return expiryDate > new Date()
  })

  useEffect(() => {
    if (!session || dismissed) return

    const checkOnboarding = async () => {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          // Show banner if user hasn't completed onboarding
          if (data.profile && !data.profile.onboardingCompleted) {
            setShowBanner(true)
          }
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error)
      }
    }

    checkOnboarding()
  }, [session, dismissed])

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    // Set expiry date 7 days from now
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + DISMISSAL_EXPIRY_DAYS)
    localStorage.setItem("onboarding-banner-dismissed", expiryDate.toISOString())
  }

  if (!showBanner || dismissed) return null

  return (
    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Complete your profile for better recommendations
              </p>
              <p className="text-xs text-slate-400">
                Tell us about your learning preferences to get personalized resource suggestions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/onboarding">
              <Button size="sm" className="accent-gradient shadow-lg shadow-primary/30 gap-2">
                Set Preferences
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
