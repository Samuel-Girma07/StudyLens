"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Footer } from "./footer"
import { OnboardingBanner } from "./onboarding-banner"
import Link from "next/link"
import { cn } from "@/lib/utils"

const sidebarItems: Array<{
  href: string
  label: string
  icon: string
  badge?: boolean
}> = [
  { href: "/", label: "Dashboard", icon: "grid_view" },
  { href: "/review", label: "Review Inbox", icon: "fact_check", badge: true },
  { href: "/browse", label: "Browse", icon: "explore" },
  { href: "/saved", label: "Saved Resources", icon: "bookmark" },
  { href: "/for-you", label: "For You", icon: "auto_awesome" },
  { href: "/analytics", label: "Analytics", icon: "insights" },
  { href: "/tutor", label: "AI Tutor", icon: "smart_toy" },
  { href: "/profile", label: "Profile", icon: "person" },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [dueCount, setDueCount] = useState(0)

  // Fetch due cards count for badge
  useEffect(() => {
    if (session) {
      fetch("/api/review")
        .then((res) => res.json())
        .then((data) => {
          setDueCount(data.stats?.dueToday || 0)
        })
        .catch(() => {
          // Silently fail - badge just won't show
        })
    }
  }, [session])

  // Don't show sidebar on auth pages or onboarding
  const showSidebar = session && !pathname.startsWith("/auth") && !pathname.startsWith("/onboarding")

  // Determine which nav item is active
  const getActiveItem = () => {
    // Dashboard is active only on exact root path
    if (pathname === "/") return "/"
    // Review is active for /review routes
    if (pathname.startsWith("/review")) return "/review"
    // Tutor is active for /tutor routes
    if (pathname.startsWith("/tutor")) return "/tutor"
    // Browse is active for /browse or when viewing resources (but not root)
    if (pathname.startsWith("/browse")) return "/browse"
    if (pathname.startsWith("/saved")) return "/saved"
    if (pathname.startsWith("/for-you")) return "/for-you"
    if (pathname.startsWith("/analytics")) return "/analytics"
    if (pathname.startsWith("/profile")) return "/profile"
    return null
  }

  const activeItem = getActiveItem()

  return (
    <div className="flex min-h-screen">
      {/* Sticky Sidebar Navigation */}
      {showSidebar && (
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="sticky top-0 h-screen w-72 border-r border-white/10 bg-background-dark/80 backdrop-blur-xl flex flex-col p-6 z-50"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 mb-12"
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="size-10 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]"
            >
              <span className="material-symbols-outlined text-black font-bold">menu_book</span>
            </motion.div>
            <div>
              <h1 className="font-serif text-xl font-black tracking-tight leading-none italic">StudyLens</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan">Premium Learning</p>
            </div>
          </motion.div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item, index) => {
              const isActive = activeItem === item.href
              const showBadge = item.badge && dueCount > 0
              
              return (
                <motion.div
                  key={item.href + item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index + 0.3 }}
                >
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 transition-all duration-200 group relative overflow-hidden",
                      isActive 
                        ? "bg-white/5 border-l-4 border-accent-cyan text-accent-cyan shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]" 
                        : "text-slate-400 hover:text-accent-cyan hover:bg-white/[0.02]"
                    )}
                  >
                    {/* Active indicator animation */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <motion.span
                      className="material-symbols-outlined"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className={cn(
                      "font-mono text-xs uppercase tracking-wider flex-1",
                      isActive && "font-bold"
                    )}>
                      {item.label}
                    </span>
                    {/* Due count badge */}
                    {showBadge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="bg-accent-lime text-black px-2 py-0.5 font-mono text-[10px] font-bold"
                      >
                        {dueCount}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-auto pt-6 border-t border-white/5"
          >
            {/* Pro Member Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-4 glass-panel border border-white/10"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(0, 255, 255, 0)",
                      "0 0 15px rgba(0, 255, 255, 0.3)",
                      "0 0 0px rgba(0, 255, 255, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="size-8 bg-gradient-to-br from-accent-cyan to-accent-lime"
                />
                <div className="overflow-hidden">
                  <p className="font-mono text-[10px] text-white truncate">Pro Member</p>
                  <p className="font-mono text-[8px] text-slate-500 uppercase">Active</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.aside>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <OnboardingBanner />
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          {children}
        </motion.div>
        <Footer />
      </main>
    </div>
  )
}
