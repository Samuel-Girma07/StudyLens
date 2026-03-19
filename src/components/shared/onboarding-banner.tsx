"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

const DISMISSAL_EXPIRY_DAYS = 7

export function OnboardingBanner() {
  const { data: session } = useSession()
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    const expiryStr = localStorage.getItem("onboarding-banner-dismissed")
    if (!expiryStr) return false
    
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
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + DISMISSAL_EXPIRY_DAYS)
    localStorage.setItem("onboarding-banner-dismissed", expiryDate.toISOString())
  }

  if (!showBanner || dismissed) return null

  return (
    <div className="relative overflow-hidden border-b border-accent-lime/20 bg-gradient-to-r from-accent-lime/[0.03] to-transparent">
      {/* Decorative left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-lime" />
      
      <div className="px-12 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-accent-lime flex items-center justify-center border-2 border-accent-cyan shadow-[2px_2px_0px_#00FFFF] shrink-0">
              <span className="material-symbols-outlined text-black font-bold">auto_awesome</span>
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-white italic">
                Complete your profile
              </p>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                Get personalized recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/onboarding">
              <Button className="bg-accent-cyan text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all h-11 px-6">
                Set Preferences
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 text-slate-500 hover:text-white hover:bg-white/5"
              onClick={handleDismiss}
            >
              <span className="material-symbols-outlined">close</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
