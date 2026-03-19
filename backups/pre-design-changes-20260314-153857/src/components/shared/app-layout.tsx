"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Footer } from "./footer"
import { OnboardingBanner } from "./onboarding-banner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Compass,
  Sparkles,
  Bookmark,
  BarChart3,
  User,
  Settings,
  BookOpen,
} from "lucide-react"

const sidebarItems = [
  { href: "/", label: "Browse", icon: Compass },
  { href: "/for-you", label: "For You", icon: Sparkles },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Don't show sidebar on auth pages or onboarding
  const showSidebar = session && !pathname.startsWith("/auth") && !pathname.startsWith("/onboarding")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OnboardingBanner />
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside className="hidden lg:flex w-64 border-r border-white/5 bg-card/30 flex-col">
            <div className="flex-1 p-4">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-11",
                          isActive
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </div>
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5">
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">StudyLens</p>
                    <p className="text-xs text-slate-400">Learn smarter</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
