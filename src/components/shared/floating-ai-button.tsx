"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { RobotReadingIcon } from "@/components/ui/robot-reading-icon"
import { TutorChat } from "@/components/tutor"

/**
 * FloatingAIButton - A floating AI tutor button accessible on all pages
 *
 * Features:
 * - No background - the robot icon floats freely by itself
 * - Holographic Engraving design with Neon Yellow and Cyan glow
 * - Only visible to authenticated users
 * - Opens full-featured TutorChat popup with conversation history
 * - Dynamic hover effects and animations
 * - Hidden on pages that have their own TutorChat (resource pages, tutor page)
 */
export function FloatingAIButton() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Don't render if user is not authenticated
  if (status !== "authenticated" || !session) {
    return null
  }

  // Pages where FloatingAIButton should NOT render
  const hiddenPaths = [
    "/auth/",        // Auth pages (sign in/up)
    "/tutor",        // Dedicated tutor page has its own chat
    "/resource/",    // Resource pages have their own TutorChat
  ]

  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path))
  if (shouldHide) {
    return null
  }

  return (
    <>
      {/* Backdrop overlay when chat is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Button - No background, just the holographic icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          // Positioning - fixed bottom-right, above footer
          "fixed z-50",
          "bottom-24 right-6",
          
          // Size container for the icon
          "size-16",
          
          // No background - transparent
          "bg-transparent",
          
          // No border
          "border-none",
          
          // No shadow on container (glow is on the icon itself)
          "shadow-none",
          
          // Cursor
          "cursor-pointer",
          
          // Flex centering for icon
          "flex items-center justify-center",
          
          // Focus states for accessibility
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark",
          
          // Transitions for hover effects
          "transition-transform duration-300 ease-out",
          
          // Hover scale effect
          isHovered && !isOpen && "scale-110",
          
          // Active state
          isOpen && "scale-95"
        )}
        aria-label={isOpen ? "Close AI Tutor" : "Open AI Tutor"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Holographic Robot Icon */}
        <RobotReadingIcon 
          size={isOpen ? 48 : 52}
          variant="holographic"
          animated={true}
          className={cn(
            // Transition for size changes
            "transition-all duration-300",
            // Enhanced glow on hover
            isHovered && !isOpen && "animate-robot-glow",
            // Add additional drop shadow on hover for extra pop
            isHovered && !isOpen && "[filter:drop-shadow(0_0_20px_rgba(0,255,255,0.5))]"
          )}
        />

        {/* AI Badge - positioned relative to the icon */}
        {!isOpen && (
          <span 
            className={cn(
              "absolute -top-1 -right-1",
              "size-5 rounded-full",
              "bg-accent-lime border-2 border-accent-cyan",
              "flex items-center justify-center",
              // Subtle pulse animation
              "animate-pulse",
              // Glow effect to match the icon
              "shadow-[0_0_8px_rgba(0,255,255,0.5)]"
            )}
          >
            <span className="text-[9px] font-black text-black">AI</span>
          </span>
        )}
      </button>

      {/* TutorChat Popup - positioned to fit viewport */}
      {isOpen && (
        <div 
          className="fixed z-50 right-4 animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ 
            bottom: '96px', // Above the floating button
            maxHeight: 'calc(100vh - 180px)' // Leave room for header and button
          }}
        >
          <TutorChat 
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="shadow-[8px_8px_0px_rgba(0,255,255,0.3)]"
          />
        </div>
      )}
    </>
  )
}
