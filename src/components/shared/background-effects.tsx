"use client"

import { useEffect, useState } from "react"

export function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setIsClient(true), 0)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background - Deep ink black */}
      <div className="absolute inset-0 bg-[#050505]" />
      
      {/* Mesh gradient overlay - Dramatic neon accents */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -30%, rgba(212, 255, 0, 0.07), transparent),
            radial-gradient(ellipse 80% 60% at 100% 50%, rgba(0, 255, 148, 0.04), transparent),
            radial-gradient(ellipse 60% 40% at 0% 70%, rgba(0, 240, 255, 0.03), transparent)
          `
        }}
      />
      
      {/* Large ambient orb - Lime */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full animate-blob"
        style={{
          background: "radial-gradient(circle, rgba(212, 255, 0, 0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "-20%",
          right: "-15%",
        }}
      />
      
      {/* Medium ambient orb - Cyan */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full animate-blob-delayed-1"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 148, 0.03) 0%, transparent 70%)",
          filter: "blur(80px)",
          bottom: "-15%",
          left: "-10%",
        }}
      />
      
      {/* Small accent orb - Blue */}
      <div 
        className="absolute w-[400px] h-[400px] rounded-full animate-blob-delayed-2"
        style={{
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.025) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "30%",
          left: "50%",
        }}
      />
      
      {/* Dot grid pattern - Subtle texture */}
      <div className="absolute inset-0 dot-grid opacity-60" />
      
      {/* Diagonal accent line - Editorial touch */}
      <div 
        className="absolute top-0 right-0 w-[1px] h-[50vh]"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(212, 255, 0, 0.1) 50%, transparent)",
          transform: "rotate(-45deg)",
          transformOrigin: "top right",
        }}
      />
      
      {/* Cursor glow - follows mouse */}
      {isClient && (
        <div 
          className="hidden lg:block absolute w-[400px] h-[400px] rounded-full transition-transform duration-300 ease-out"
          style={{
            background: "radial-gradient(circle, rgba(212, 255, 0, 0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
            transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
          }}
        />
      )}
      
      {/* Vignette effect - Dramatic edges */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 5, 0.5) 100%)",
        }}
      />
      
      {/* Top edge glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(212, 255, 0, 0.1) 50%, transparent)",
        }}
      />
    </div>
  )
}
