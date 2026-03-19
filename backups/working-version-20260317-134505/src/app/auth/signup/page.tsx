"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    name: "",
    email: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validateName = (name: string): string => {
    if (!name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    return ""
  }

  const passwordRequirements = [
    { text: "At least 6 characters", met: formData.password.length >= 6 },
    { text: "Passwords match", met: formData.password === formData.confirmPassword && formData.password.length > 0 },
  ]

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { score, label: "Weak", color: "text-red-400" }
    if (score <= 2) return { score, label: "Fair", color: "text-amber-400" }
    if (score <= 3) return { score, label: "Good", color: "text-accent-lime" }
    return { score, label: "Strong", color: "text-accent-cyan" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameError = validateName(formData.name)
    if (nameError) {
      setErrors(prev => ({ ...prev, name: nameError }))
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show specific error message from API
        if (data.details) {
          // Handle validation errors with details
          const errorMessages = Object.values(data.details).flat().join(", ")
          toast.error(errorMessages || data.error || "Failed to create account")
        } else {
          toast.error(data.error || "Failed to create account")
        }
        return
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        toast.success("Account created successfully!")
        router.push("/onboarding")
        router.refresh()
      } else {
        toast.success("Account created! Please sign in.")
        router.push("/auth/signin")
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
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent-lime/[0.02] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent-cyan/[0.02] rounded-full blur-[120px]" />
        
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
                Get Started
              </span>
              <h1 className="font-serif text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                Begin<br />Your<br />
                <span className="text-accent-cyan">Journey</span>
              </h1>
            </div>
            
            <p className="font-sans text-slate-400 max-w-md border-l-2 border-accent-lime pl-6 py-2">
              Create your account to unlock personalized recommendations and track your learning progress.
            </p>
            
            {/* Features */}
            <div className="space-y-4 pt-8 border-t border-white/5">
              {[
                { icon: "psychology", text: "AI-powered recommendations" },
                { icon: "target", text: "Personalized learning paths" },
                { icon: "trending_up", text: "Track your progress" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="size-10 bg-accent-cyan flex items-center justify-center border border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
                    <span className="material-symbols-outlined text-black text-sm">{feature.icon}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-300 uppercase tracking-wider">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom */}
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} StudyLens
          </p>
        </div>
      </div>
      
      {/* Right Side - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-[#050505]">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="size-10 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-black text-sm font-bold">menu_book</span>
            </div>
            <span className="font-serif text-lg font-black italic text-white">StudyLens</span>
          </Link>
        </div>
        
        <div className="w-full max-w-md py-20 lg:py-0">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex gap-2 mb-4">
              <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">New</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Account</span>
            </nav>
            <h2 className="font-serif text-6xl font-black text-white italic tracking-tighter leading-[0.9]">
              Create <span className="text-accent-cyan">Account</span>
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-4 uppercase tracking-widest">
              Enter your details to get started
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">person</span>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: validateName(e.target.value) }))
                    }
                  }}
                  onBlur={() => setErrors(prev => ({ ...prev, name: validateName(formData.name) }))}
                  className={`w-full pl-12 h-12 bg-white/[0.03] rounded-none border ${errors.name ? 'border-red-500' : 'border-white/10'} text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:ring-0 focus-visible:ring-0 font-sans`}
                  required
                />
              </div>
              {errors.name && (
                <p className="font-mono text-[10px] text-red-400 flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.name}
                </p>
              )}
            </div>

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
                  className="w-full pl-12 h-12 bg-white/[0.03] rounded-none border border-white/10 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:ring-0 focus-visible:ring-0 font-sans"
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
                  className="w-full pl-12 pr-12 h-12 bg-white/[0.03] rounded-none border border-white/10 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:ring-0 focus-visible:ring-0 font-sans"
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
              
              {/* Password Strength */}
              {formData.password && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-1.5 bg-white/5 overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 transition-all ${
                          passwordStrength.score >= level
                            ? passwordStrength.score <= 1
                              ? "bg-red-400"
                              : passwordStrength.score <= 2
                              ? "bg-amber-400"
                              : passwordStrength.score <= 3
                              ? "bg-accent-lime"
                              : "bg-accent-cyan"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">lock</span>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-12 h-12 bg-white/[0.03] rounded-none border border-white/10 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:ring-0 focus-visible:ring-0 font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Password Requirements */}
              <div className="flex flex-wrap gap-3 pt-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-4 h-4 flex items-center justify-center transition-all ${req.met ? "bg-accent-lime" : "bg-white/10"}`}>
                      {req.met && <span className="material-symbols-outlined text-black text-xs">check</span>}
                    </div>
                    <span className={`font-mono text-[10px] uppercase tracking-wider transition-colors ${req.met ? "text-accent-lime" : "text-slate-500"}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-accent-cyan text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 flex items-center gap-3 text-slate-500">
            <span className="material-symbols-outlined text-accent-cyan text-sm">shield</span>
            <p className="font-mono text-[10px] uppercase tracking-widest">
              Your data is encrypted and secure
            </p>
          </div>

          {/* Sign In Link */}
          <p className="text-center mt-8 font-mono text-xs text-slate-500 uppercase tracking-wider">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-accent-cyan font-bold hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
