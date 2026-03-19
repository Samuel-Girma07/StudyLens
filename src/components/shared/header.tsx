"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/auth")
  const isOnboarding = pathname.startsWith("/onboarding")
  const isLandingPage = pathname === "/" && !session
  
  // Hide header on auth pages
  if (isAuthPage) return null

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      // Only show header on landing page when not logged in
      !session && isLandingPage ? "block" : "hidden lg:block"
    )}>
      {/* Main header with glass effect */}
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-xl border-b border-white/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00] transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-black font-bold">menu_book</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif text-xl font-black tracking-tight leading-none italic">StudyLens</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan">Premium Learning</p>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="size-10 bg-white/5 animate-pulse" />
            ) : session ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative size-10 p-0 overflow-hidden group" aria-label={`User menu for ${session.user?.name || "User"}`}>
                        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-accent-cyan/10 text-accent-cyan font-mono font-semibold text-sm border border-accent-cyan/30">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 overflow-hidden">
                      <DropdownMenuLabel className="font-normal px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <p className="font-mono text-sm font-semibold text-white">{session.user?.name}</p>
                          <p className="font-mono text-[10px] text-slate-500">{session.user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer text-slate-300 focus:text-white focus:bg-white/5">
                        <Link href="/profile" className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span className="font-mono text-xs uppercase tracking-wider">Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer text-slate-300 focus:text-white focus:bg-white/5">
                        <Link href="/saved" className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm">bookmark</span>
                          <span className="font-mono text-xs uppercase tracking-wider">Saved</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer text-slate-300 focus:text-white focus:bg-white/5">
                        <Link href="/analytics" className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm">insights</span>
                          <span className="font-mono text-xs uppercase tracking-wider">Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem 
                        className="px-4 py-2.5 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10 flex items-center gap-3"
                        onClick={() => {
                          signOut({ callbackUrl: "/" })
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span className="font-mono text-xs uppercase tracking-wider">Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider"
                  onClick={() => signIn()}
                >
                  Sign In
                </Button>
                <Link href="/auth/signup">
                  <Button className="bg-accent-cyan text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
