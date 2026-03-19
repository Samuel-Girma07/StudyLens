"use client"

import { useEffect, useState } from "react"

export function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set isClient after initial render
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
      {/* Base background */}
      <div className="absolute inset-0 bg-[#0f0a08]" />
      
      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(236, 91, 19, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(236, 91, 19, 0.1), transparent),
            radial-gradient(ellipse 50% 30% at 0% 80%, rgba(236, 91, 19, 0.08), transparent)
          `
        }}
      />
      
      {/* Animated orbs */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full animate-blob"
        style={{
          background: "radial-gradient(circle, rgba(236, 91, 19, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "-10%",
          right: "-10%",
        }}
      />
      
      <div 
        className="absolute w-[500px] h-[500px] rounded-full animate-blob-delayed-1"
        style={{
          background: "radial-gradient(circle, rgba(236, 91, 19, 0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
          bottom: "-10%",
          left: "-10%",
        }}
      />
      
      <div 
        className="absolute w-[400px] h-[400px] rounded-full animate-blob-delayed-2"
        style={{
          background: "radial-gradient(circle, rgba(236, 91, 19, 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "40%",
          left: "40%",
        }}
      />
      
      {/* Dots pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(236, 91, 19, 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      
      {/* Cursor glow - only on desktop */}
      {isClient && (
        <div 
          className="hidden lg:block absolute w-[400px] h-[400px] rounded-full transition-transform duration-150 ease-out"
          style={{
            background: "radial-gradient(circle, rgba(236, 91, 19, 0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
          }}
        />
      )}
    </div>
  )
}
