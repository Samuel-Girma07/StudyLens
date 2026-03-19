"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  BookOpen,
} from "lucide-react"
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
  subjectIcons,
  formatIcons,
  experienceIcons,
  timeIcons,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("moderate") // Default to moderate

  // Redirect if not authenticated
  useEffect(() => {
    if (!session && session !== undefined) {
      router.push("/auth/signin")
    }
  }, [session, router])

  // Load existing preferences
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
            setSelectedTime(timeCommitment || "moderate") // Default to moderate if not set
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
    // Button will be disabled, but keep logic for safety
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StudyLens</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              Skip for now
            </Button>
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-primary font-semibold">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-white/5 [&>div]:bg-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
        <Card className="glass-panel border-white/10">
          <CardContent className="p-6 sm:p-8">
            {/* Step 1: Subjects */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    What subjects interest you?
                  </h2>
                  <p className="text-slate-400">
                    Select all that apply to personalize your recommendations
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allSubjects.map((subject) => {
                    const Icon = subjectIcons[subject]
                    const isSelected = selectedSubjects.includes(subject)
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={cn(
                          "relative p-4 rounded-xl border transition-all text-left",
                          isSelected
                            ? "border-primary/50 bg-primary/5"
                            : "border-white/10 hover:border-primary/30"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center mb-2",
                          isSelected ? "bg-primary/20" : "bg-white/5"
                        )}>
                          <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-slate-400")} />
                        </div>
                        <span className={cn("text-sm font-semibold", isSelected ? "text-white" : "text-slate-300")}>
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    How do you prefer to learn?
                  </h2>
                  <p className="text-slate-400">
                    Select the format that best suits your daily routine
                  </p>
                </div>
                <div className="space-y-3">
                  {allFormats.map((format) => {
                    const Icon = formatIcons[format]
                    const isSelected = selectedFormats.includes(format)
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => handleFormatToggle(format)}
                        className={cn(
                          "relative w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4",
                          isSelected
                            ? "border-primary/50 bg-primary/5"
                            : "border-white/10 hover:border-primary/30"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                          isSelected ? "bg-primary" : "bg-white/5"
                        )}>
                          <Icon className={cn("w-7 h-7", isSelected ? "text-white" : "text-slate-400")} />
                        </div>
                        <div>
                          <div className={cn("text-lg font-semibold", isSelected ? "text-white" : "text-slate-300")}>
                            {formatNames[format]}
                          </div>
                          <div className="text-sm text-slate-400">
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
              <div className="space-y-6">
                {/* Experience Level */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Experience Level
                  </h2>
                  <p className="text-slate-400 mb-4">
                    What&apos;s your current knowledge level?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {allExperienceLevels.map((level) => {
                      const Icon = experienceIcons[level]
                      const isSelected = selectedExperience === level
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSelectedExperience(level)}
                          className={cn(
                            "relative p-4 rounded-xl border transition-all text-left",
                            isSelected
                              ? "border-primary/50 bg-primary/5"
                              : "border-white/10 hover:border-primary/30"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center mb-2",
                            isSelected ? "bg-primary" : "bg-white/5"
                          )}>
                            <Icon className={cn("w-7 h-7", isSelected ? "text-white" : "text-slate-400")} />
                          </div>
                          <div className={cn("text-lg font-semibold", isSelected ? "text-white" : "text-slate-300")}>
                            {experienceNames[level]}
                          </div>
                          <div className="text-sm text-slate-400">
                            {experienceDescriptions[level]}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Commitment */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Time Commitment <span className="text-base font-normal text-slate-500">(Optional)</span>
                  </h2>
                  <p className="text-slate-400 mb-4">
                    How much time can you dedicate daily?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {allTimeCommitments.map((time) => {
                      const Icon = timeIcons[time]
                      const isSelected = selectedTime === time
                      const isRecommended = time === "moderate"
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "relative p-4 rounded-xl border transition-all text-left",
                            isSelected
                              ? "border-primary/50 bg-primary/5"
                              : isRecommended
                              ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                              : "border-white/10 hover:border-primary/30"
                          )}
                        >
                          {isSelected ? (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : isRecommended ? (
                            <span className="absolute top-2 right-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                              Recommended
                            </span>
                          ) : null}
                          <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center mb-2",
                            isSelected ? "bg-primary" : "bg-white/5"
                          )}>
                            <Icon className={cn("w-7 h-7", isSelected ? "text-white" : "text-slate-400")} />
                          </div>
                          <div className={cn("text-lg font-semibold", isSelected ? "text-white" : "text-slate-300")}>
                            {timeNames[time]}
                          </div>
                          <div className="text-sm text-slate-400">
                            {timeDescriptions[time]}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="accent-gradient shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedExperience}
              className="accent-gradient shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
