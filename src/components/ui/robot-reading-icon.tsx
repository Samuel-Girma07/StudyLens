"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * RobotReadingIcon - A custom SVG icon depicting a robot reading a book
 * with "Holographic Engraving" aesthetic
 *
 * Color Palette:
 * - Deep Obsidian Black (#0A0A0B): Filled shapes (head, face, book pages)
 * - Neon Yellow (#DFFF00): Strokes and outlines (antennae, head ellipse, book edges)
 * - Cyan Glow: Reactive drop-shadow effect
 *
 * @param size - Width and height of the icon (default: 32)
 * @param className - Additional CSS classes
 * @param variant - "holographic" (default, full glow) or "minimal" (no glow, for dark backgrounds)
 * @param animated - Enable pulse/float animations (default: true)
 */
interface RobotReadingIconProps {
  size?: number
  className?: string
  variant?: "holographic" | "minimal"
  animated?: boolean
}

// Holographic Engraving Color Palette
const COLORS = {
  deepBlack: "#0A0A0B",      // Primary "Material" - filled shapes
  neonYellow: "#DFFF00",     // "Glow" Silhouette - strokes/lines
  cyan: "#00FFFF",           // Interaction - glow effect
} as const

export function RobotReadingIcon({ 
  size = 32, 
  className,
  variant = "holographic",
  animated = true,
}: RobotReadingIconProps) {
  // Generate unique IDs for SVG filters to avoid conflicts when multiple instances exist
  const id = useId()
  const glowId = `robot-glow-${id}`
  const pulseGlowId = `robot-pulse-glow-${id}`

  // For holographic variant, use the cyan glow
  // For minimal variant (used on dark backgrounds), no glow
  const isHolographic = variant === "holographic"
  
  // Stroke color: Neon Yellow for holographic, currentColor for minimal
  const strokeColor = isHolographic ? COLORS.neonYellow : "currentColor"
  
  // Fill color for filled shapes: Deep Black for holographic, currentColor for minimal
  const fillColor = isHolographic ? COLORS.deepBlack : "currentColor"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={cn(
        "shrink-0",
        animated && isHolographic && "animate-robot-float",
        className
      )}
      aria-label="AI Tutor - Robot Reading"
      role="img"
    >
      <defs>
        {/* Cyan Glow Filter - for holographic effect */}
        {isHolographic && (
          <>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow 
                dx="0" 
                dy="0" 
                stdDeviation="8" 
                floodColor={COLORS.cyan}
                floodOpacity="0.4"
              />
            </filter>
            
            {/* Pulsing glow animation filter */}
            <filter id={pulseGlowId} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow 
                dx="0" 
                dy="0" 
                stdDeviation="12" 
                floodColor={COLORS.cyan}
                floodOpacity="0.6"
              >
                <animate 
                  attributeName="floodOpacity" 
                  values="0.3;0.6;0.3" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
              </feDropShadow>
            </filter>
          </>
        )}
      </defs>

      {/* Main icon group with glow filter applied */}
      <g filter={isHolographic ? `url(#${glowId})` : undefined}>
        
        {/* ============================================ */}
        {/* ANTENNAE - Neon Yellow strokes with glow */}
        {/* ============================================ */}
        
        {/* Left antenna */}
        <path
          d="M 180,105 Q 160,80 145,55"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left antenna tip - filled Neon Yellow */}
        <circle
          cx="140"
          cy="50"
          r="12"
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth="2"
        />
        
        {/* Right antenna */}
        <path
          d="M 320,105 Q 340,80 355,55"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right antenna tip - filled Neon Yellow */}
        <circle
          cx="360"
          cy="50"
          r="12"
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* ============================================ */}
        {/* SHOULDERS/NECK LINE - Neon Yellow */}
        {/* ============================================ */}
        <path
          d="M 145 220 Q 250 200 355 220"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ============================================ */}
        {/* ROBOT HEAD */}
        {/* - Deep Black fill (the "material") */}
        {/* - Neon Yellow stroke (the "glow silhouette") */}
        {/* ============================================ */}
        <ellipse
          cx="250"
          cy="150"
          rx="110"
          ry="85"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
        />

        {/* ============================================ */}
        {/* FACE SCREEN AREA */}
        {/* - Slightly lighter black for screen effect */}
        {/* ============================================ */}
        <path
          d="M 170 140 C 170 85, 330 85, 330 140 C 330 190, 280 200, 250 200 C 220 200, 170 190, 170 140 Z"
          fill={isHolographic ? "#0F0F12" : fillColor}
          stroke="none"
        />

        {/* ============================================ */}
        {/* EYES - Neon Yellow U-shapes */}
        {/* ============================================ */}
        {/* Left eye */}
        <path
          d="M 200 130 Q 215 105 230 130"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Right eye */}
        <path
          d="M 270 130 Q 285 105 300 130"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* ============================================ */}
        {/* SMILE - Neon Yellow curve */}
        {/* ============================================ */}
        <path
          d="M 225 155 Q 250 180 275 155"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* ============================================ */}
        {/* BOOK SPINE - Neon Yellow */}
        {/* ============================================ */}
        <polygon
          points="225,285 275,285 275,450 225,450"
          fill={strokeColor}
          stroke="none"
        />

        {/* ============================================ */}
        {/* BOOK PAGES */}
        {/* - Deep Black fill (the "material") */}
        {/* - Neon Yellow stroke (the "glow silhouette") */}
        {/* ============================================ */}
        
        {/* Left page */}
        <path
          d="M 225 285 Q 160 250 90 270 L 90 410 Q 160 390 225 450 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right page */}
        <path
          d="M 275 285 Q 340 250 410 270 L 410 410 Q 340 390 275 450 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center page dip */}
        <path
          d="M 225 285 Q 250 305 275 285"
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ============================================ */}
        {/* HANDS */}
        {/* - Deep Black fill */}
        {/* - Neon Yellow stroke */}
        {/* ============================================ */}
        
        {/* Left hand */}
        <path
          d="M 60 310 L 90 310 L 90 400 L 60 400 A 15 15 0 0 1 45 385 L 45 325 A 15 15 0 0 1 60 310 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="90"
          y="335"
          width="25"
          height="35"
          rx="10"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right hand */}
        <path
          d="M 440 310 L 410 310 L 410 400 L 440 400 A 15 15 0 0 0 455 385 L 455 325 A 15 15 0 0 0 440 310 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="385"
          y="335"
          width="25"
          height="35"
          rx="10"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
