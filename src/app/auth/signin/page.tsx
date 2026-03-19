"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
      } else {
        toast.success("Signed in successfully!")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: "demo@studylens.com",
        password: "demo123",
        redirect: false,
      })

      if (result?.error) {
        toast.error("Demo account sign in failed")
      } else {
        toast.success("Signed in with demo account!")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#050505]">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-lime/[0.02] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-cyan/[0.02] rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group w-fit">
            <div className="size-12 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-black font-bold">menu_book</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-black tracking-tight leading-none italic">StudyLens</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan">Premium Learning</p>
            </div>
          </Link>
          
          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <span className="font-mono text-[10px] text-accent-lime uppercase tracking-tighter bg-accent-lime/10 px-2 py-1 italic mb-4 inline-block">
                Welcome Back
              </span>
              <h1 className="font-serif text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                Continue<br />Your<br />
                <span className="text-accent-cyan">Journey</span>
              </h1>
            </div>
            
            <p className="font-sans text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
              Sign in to access your personalized recommendations, saved resources, and learning analytics.
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-white/5">
              <div>
                <p className="font-serif text-4xl font-black text-white">10K+</p>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Resources</p>
              </div>
              <div>
                <p className="font-serif text-4xl font-black text-accent-lime">5K+</p>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Learners</p>
              </div>
            </div>
          </div>
          
          {/* Bottom */}
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} StudyLens
          </p>
        </div>
      </div>
      
      {/* Right Side - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-[#050505]">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="size-10 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-black text-sm font-bold">menu_book</span>
            </div>
            <span className="font-serif text-lg font-black italic text-white">StudyLens</span>
          </Link>
        </div>
        
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <nav className="flex gap-2 mb-4">
              <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Account</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Access</span>
            </nav>
            <h2 className="font-serif text-6xl font-black text-white italic tracking-tighter leading-[0.9]">
              Sign <span className="text-accent-cyan">In</span>
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-4 uppercase tracking-widest">
              Enter your credentials to continue
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">mail</span>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none font-sans"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">lock</span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-accent-cyan text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050505] px-4 font-mono text-[10px] text-slate-600 uppercase tracking-widest">Or</span>
            </div>
          </div>

          {/* Demo Account */}
          <button
            type="button"
            className="w-full h-12 glass-panel border border-white/20 font-mono text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            disabled={isLoading}
            onClick={handleDemoSignIn}
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm text-accent-lime">auto_awesome</span>
                Sign in with Demo Account
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <p className="text-center mt-8 font-mono text-xs text-slate-500 uppercase tracking-wider">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-accent-cyan font-bold hover:text-white transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-accent-cyan text-4xl animate-spin">progress_activity</span>
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
