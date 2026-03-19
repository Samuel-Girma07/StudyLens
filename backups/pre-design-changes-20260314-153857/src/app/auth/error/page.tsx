"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    console.error("Auth error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
        <p className="text-slate-400 mb-6">
          {error === "OAuthAccountNotLinked"
            ? "An account with this email already exists. Please sign in with your original provider."
            : "Something went wrong during authentication. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/signin">
            <Button className="accent-gradient">Try Again</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white/10 text-slate-300">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
