"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error)
    }
  }, [error])

  const getErrorMessage = () => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return "An account with this email already exists. Please sign in with your original provider."
      case "AccessDenied":
        return "Access denied. You may not have permission to access this resource."
      case "Verification":
        return "The verification link may have expired. Please request a new one."
      case "Configuration":
        return "There is a problem with the server configuration."
      default:
        return "Something went wrong during authentication. Please try again."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
      {/* Background decorations */}
      <div className="fixed top-0 right-0 -z-10 w-[50vw] h-[50vh] bg-red-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[40vw] h-[40vh] bg-accent-cyan/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="relative mb-8 text-center">
          <div className="inline-flex size-32 bg-red-500/5 border-2 border-dashed border-red-500 items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-red-400 font-thin">error</span>
          </div>
          <div className="absolute -bottom-4 -right-4 left-1/2 translate-x-8 size-16 bg-accent-lime flex items-center justify-center shadow-[4px_4px_0px_#000]">
            <span className="material-symbols-outlined text-black font-bold">close</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <nav className="flex gap-2 justify-center mb-4">
            <span className="font-mono text-[10px] text-red-400 uppercase tracking-tighter bg-red-500/10 px-2 py-1 italic">Error</span>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Authentication</span>
          </nav>
          
          <h1 className="font-serif text-5xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
            Oops, <span className="text-red-400">Error</span>
          </h1>
          
          <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm mx-auto mb-8">
            {getErrorMessage()}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <button className="bg-accent-cyan text-black px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all">
                Try Again
              </button>
            </Link>
            <Link href="/">
              <button className="glass-panel px-8 py-4 border border-white/20 font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                Go Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
