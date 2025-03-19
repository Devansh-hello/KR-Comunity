"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

// Radial gradient spotlight that follows mouse
export function SpotlightEffect({ 
  children,
  className = "",
  size = "60rem",
  strength = 0.15,
  color = "hsl(var(--primary) / 0.3)"
}: {
  children: React.ReactNode
  className?: string
  size?: string
  strength?: number
  color?: string
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (!divRef.current) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const div = divRef.current
      if (!div) return
      
      const rect = div.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePosition({ x, y })
    }
    
    const div = divRef.current
    div.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      div.removeEventListener("mousemove", handleMouseMove)
    }
  }, [divRef, isClient])
  
  if (!isClient) {
    return <div className={className}>{children}</div>
  }
  
  return (
    <div 
      ref={divRef} 
      className={`relative overflow-hidden ${className}`}
      style={{
        "--x": `${mousePosition.x}px`,
        "--y": `${mousePosition.y}px`,
        "--size": size,
        "--strength": strength,
        "--color": color
      } as React.CSSProperties}
    >
      <div 
        className="absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(
            var(--size) circle at var(--x) var(--y),
            var(--color),
            transparent var(--strength)
          )`
        }}
      />
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}

// Modern gradient shimmer effect
export function ShimmerEffect({ 
  children,
  className = "",
  shimmerWidth = "70%",
  shimmerColor = "rgba(255, 255, 255, 0.15)"
}: {
  children: React.ReactNode
  className?: string
  shimmerWidth?: string
  shimmerColor?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            ${shimmerColor} 50%,
            transparent 100%
          )`,
          backgroundSize: `${shimmerWidth} 100%`,
          backgroundRepeat: "no-repeat"
        }}
        animate={{
          x: ["calc(-100% - 50px)", "calc(100% + 50px)"]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1
        }}
      />
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}

// 3D Tilt Card Effect
export function TiltCard({
  children,
  className = "",
  perspective = 1000,
  intensity = 10,
  glare = true,
  glareOpacity = 0.2,
  borderRadius = "inherit"
}: {
  children: React.ReactNode
  className?: string
  perspective?: number
  intensity?: number
  glare?: boolean
  glareOpacity?: number
  borderRadius?: string
}) {
  const [isClient, setIsClient] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    
    // Calculate mouse position relative to card
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate tilt values
    // Convert to percentage and then to tilt angle
    const tiltX = ((y / rect.height) * 2 - 1) * -intensity
    const tiltY = ((x / rect.width) * 2 - 1) * intensity
    
    // Calculate glare position
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    
    setTilt({ x: tiltX, y: tiltY })
    setGlarePosition({ x: glareX, y: glareY })
  }
  
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }
  
  if (!isClient) {
    return <div className={className}>{children}</div>
  }
  
  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transform: `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.1s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
        borderRadius
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at ${glarePosition.x}% ${glarePosition.y}%,
              rgba(255, 255, 255, ${glareOpacity}) 0%,
              rgba(255, 255, 255, 0) 80%
            )`,
            borderRadius: "inherit",
          }}
        />
      )}
    </div>
  )
}

// Animated Glow Border
export function GlowBorder({
  children,
  className = "",
  size = "2px",
  color = "hsl(var(--primary) / 0.6)",
  animated = true,
  borderRadius = "0.5rem"
}: {
  children: React.ReactNode
  className?: string
  size?: string
  color?: string
  animated?: boolean
  borderRadius?: string
}) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ borderRadius }}
    >
      <div 
        className={`absolute inset-0 -z-10 ${animated ? 'animate-pulse' : ''}`}
        style={{
          padding: size,
          background: color,
          borderRadius: `calc(${borderRadius} + ${size})`,
          opacity: 0.6,
        }}
      />
      {children}
    </div>
  )
} 