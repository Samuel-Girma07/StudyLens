"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  allSubjects,
  allFormats,
  allExperienceLevels,
  allTimeCommitments,
  subjectNames,
  formatNames,
  formatDescriptions,
  experienceNames,
  experienceDescriptions,
  timeNames,
  timeDescriptions,
  subjectGradients,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("moderate")

  useEffect(() => {
    if (!session && session !== undefined) {
      router.push("/auth/signin")
    }
  }, [session, router])

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            const { subjects, formats, experienceLevel, timeCommitment } = data.profile
            setSelectedSubjects(subjects)
            setSelectedFormats(formats)
            setSelectedExperience(experienceLevel)
            setSelectedTime(timeCommitment || "moderate")
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error)
      }
    }
    loadPreferences()
  }, [])

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleFormatToggle = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedSubjects.length > 0
    if (currentStep === 2) return selectedFormats.length > 0
    if (currentStep === 3) return selectedExperience !== ""
    return true
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedExperience) {
      toast.error("Please select your experience level")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: selectedSubjects,
          formats: selectedFormats,
          experienceLevel: selectedExperience,
          timeCommitment: selectedTime || "moderate",
        }),
      })

      if (response.ok) {
        toast.success("Preferences saved!")
        if (update) {
          await update({ hasCompletedOnboarding: true })
        }
        router.push("/for-you")
      } else {
        toast.error("Failed to save preferences")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050505]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-accent-cyan/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-accent-lime/[0.02] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[2px_2px_0px_#CCFF00]">
              <span className="material-symbols-outlined text-black font-bold">menu_book</span>
            </div>
            <div>
              <h1 className="font-serif text-lg font-black tracking-tight leading-none italic">StudyLens</h1>
              <p className="font-mono text-[8px] uppercase tracking-widest text-accent-cyan">Setup</p>
            </div>
          </Link>
          <Link href="/" className="font-mono text-[10px] text-slate-500 uppercase tracking-wider hover:text-accent-cyan transition-colors flex items-center gap-1">
            Skip for now
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Progress Section */}
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-8 w-full relative z-10">
        {/* Progress header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="size-2 bg-accent-cyan animate-pulse" />
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <span className="font-mono text-[10px] text-accent-lime uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            {Math.round(progress)}% Complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent-lime to-accent-cyan transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={cn(
                "size-12 flex items-center justify-center font-mono text-xs font-bold transition-all",
                currentStep >= step 
                  ? "bg-accent-cyan text-black" 
                  : "bg-white/[0.03] text-slate-500 border border-white/10"
              )}>
                {currentStep > step ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : (
                  step
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto px-6 lg:px-12 pb-8 w-full relative z-10">
        <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
          {/* Content */}
          <div className="p-8 sm:p-10">
            {/* Step 1: Subjects */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <nav className="flex gap-2 justify-center mb-4">
                    <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Step 01</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Interests</span>
                  </nav>
                  <h2 className="font-serif text-5xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
                    What <span className="text-accent-cyan">Subjects</span>?
                  </h2>
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                    Select all that apply to personalize your recommendations
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {allSubjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject)
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        aria-pressed={isSelected}
                        aria-label={`Select ${subjectNames[subject]}`}
                        className={cn(
                          "relative p-5 border transition-all text-left group overflow-hidden",
                          isSelected
                            ? "bg-accent-cyan/5 border-accent-cyan/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 size-6 bg-accent-cyan flex items-center justify-center">
                            <span className="material-symbols-outlined text-black text-sm">check</span>
                          </div>
                        )}
                        <div className={cn(
                          "size-12 flex items-center justify-center mb-3 transition-all",
                          isSelected 
                            ? "bg-accent-cyan/20" 
                            : `bg-gradient-to-br ${subjectGradients[subject]} opacity-80 group-hover:opacity-100`
                        )}>
                          <span className={cn("material-symbols-outlined", isSelected ? "text-accent-cyan" : "text-white/80")}>
                            {subject === 'programming' ? 'code' : subject === 'design' ? 'palette' : subject === 'mathematics' ? 'calculate' : subject === 'science' ? 'science' : subject === 'languages' ? 'translate' : 'business_center'}
                          </span>
                        </div>
                        <span className={cn("font-serif text-lg font-bold transition-colors", isSelected ? "text-white" : "text-slate-300 group-hover:text-white")}>
                          {subjectNames[subject]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Formats */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <nav className="flex gap-2 justify-center mb-4">
                    <span className="font-mono text-[10px] text-accent-lime uppercase tracking-tighter bg-accent-lime/10 px-2 py-1 italic">Step 02</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Style</span>
                  </nav>
                  <h2 className="font-serif text-5xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
                    How <span className="text-accent-lime">Learn</span>?
                  </h2>
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                    Select the formats that best suit your daily routine
                  </p>
                </div>
                <div className="space-y-3">
                  {allFormats.map((format) => {
                    const isSelected = selectedFormats.includes(format)
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => handleFormatToggle(format)}
                        aria-pressed={isSelected}
                        aria-label={`Select ${formatNames[format]}`}
                        className={cn(
                          "relative w-full p-5 border transition-all text-left flex items-center gap-4 group overflow-hidden",
                          isSelected
                            ? "bg-accent-lime/5 border-accent-lime/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 size-6 bg-accent-lime flex items-center justify-center">
                            <span className="material-symbols-outlined text-black text-sm">check</span>
                          </div>
                        )}
                        <div className={cn(
                          "size-14 flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "bg-accent-lime" : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                        )}>
                          <span className={cn("material-symbols-outlined text-2xl", isSelected ? "text-black" : "text-slate-400 group-hover:text-white")}>
                            {format === 'books' ? 'menu_book' : format === 'videos' ? 'play_circle' : 'article'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className={cn("font-serif text-lg font-bold", isSelected ? "text-white" : "text-slate-300 group-hover:text-white")}>
                            {formatNames[format]}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                            {formatDescriptions[format]}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Experience & Time */}
            {currentStep === 3 && (
              <div className="space-y-10">
                {/* Experience Level */}
                <div>
                  <div className="text-center mb-6">
                    <nav className="flex gap-2 justify-center mb-4">
                      <span className="font-mono text-[10px] text-accent-cyan uppercase tracking-tighter bg-accent-cyan/10 px-2 py-1 italic">Step 03</span>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Level</span>
                    </nav>
                    <h2 className="font-serif text-5xl font-black text-white italic tracking-tighter leading-[0.9] mb-4">
                      Your <span className="text-accent-cyan">Level</span>
                    </h2>
                    <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                      What&apos;s your current knowledge level?
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {allExperienceLevels.map((level) => {
                      const isSelected = selectedExperience === level
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSelectedExperience(level)}
                          aria-pressed={isSelected}
                          aria-label={`Select ${experienceNames[level]} level`}
                          className={cn(
                            "relative p-5 border transition-all text-left group overflow-hidden",
                            isSelected
                              ? "bg-accent-cyan/5 border-accent-cyan/30"
                              : "bg-white/[0.02] border-white/10 hover:border-white/20"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 size-6 bg-accent-cyan flex items-center justify-center">
                              <span className="material-symbols-outlined text-black text-sm">check</span>
                            </div>
                          )}
                          <div className={cn(
                            "size-14 flex items-center justify-center mb-4 transition-all",
                            isSelected ? "bg-accent-cyan" : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                          )}>
                            <span className={cn("material-symbols-outlined text-2xl", isSelected ? "text-black" : "text-slate-400 group-hover:text-white")}>
                              {level === 'beginner' ? 'school' : level === 'intermediate' ? 'trending_up' : 'emoji_events'}
                            </span>
                          </div>
                          <div className={cn("font-serif text-lg font-bold mb-1", isSelected ? "text-white" : "text-slate-300 group-hover:text-white")}>
                            {experienceNames[level]}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                            {experienceDescriptions[level]}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Commitment */}
                <div>
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-3xl font-black text-white italic tracking-tighter mb-2">
                      Time <span className="text-accent-lime">Commitment</span>
                    </h2>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                      How much time can you dedicate daily? <span className="text-slate-600">(Optional)</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {allTimeCommitments.map((time) => {
                      const isSelected = selectedTime === time
                      const isRecommended = time === "moderate"
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          aria-pressed={isSelected}
                          aria-label={`Select ${timeNames[time]} time commitment`}
                          className={cn(
                            "relative p-5 border transition-all text-left group overflow-hidden",
                            isSelected
                              ? "bg-accent-lime/5 border-accent-lime/30"
                              : isRecommended
                              ? "bg-white/[0.02] border-accent-lime/20 hover:border-accent-lime/40"
                              : "bg-white/[0.02] border-white/10 hover:border-white/20"
                          )}
                        >
                          {isSelected ? (
                            <div className="absolute top-3 right-3 size-6 bg-accent-lime flex items-center justify-center">
                              <span className="material-symbols-outlined text-black text-sm">check</span>
                            </div>
                          ) : isRecommended ? (
                            <span className="absolute top-3 right-3 font-mono text-[8px] bg-accent-lime/20 text-accent-lime px-2 py-1 uppercase tracking-widest">
                              Popular
                            </span>
                          ) : null}
                          <div className={cn(
                            "size-14 flex items-center justify-center mb-4 transition-all",
                            isSelected ? "bg-accent-lime" : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                          )}>
                            <span className={cn("material-symbols-outlined text-2xl", isSelected ? "text-black" : "text-slate-400 group-hover:text-white")}>
                              {time === 'casual' ? 'speed' : time === 'moderate' ? 'schedule' : 'all_inclusive'}
                            </span>
                          </div>
                          <div className={cn("font-serif text-lg font-bold mb-1", isSelected ? "text-white" : "text-slate-300 group-hover:text-white")}>
                            {timeNames[time]}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                            {timeDescriptions[time]}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="h-12 px-6 font-mono text-xs uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-12 px-8 bg-accent-cyan text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#CCFF00] hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              Continue
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedExperience}
              className="h-12 px-8 bg-accent-lime text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <span className="material-symbols-outlined text-sm">check</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
