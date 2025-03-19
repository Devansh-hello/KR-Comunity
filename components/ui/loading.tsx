"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LoadingProps {
  variant?: 'dots' | 'spinner' | 'pulse' | 'glow' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export function Loading({
  variant = 'dots',
  size = 'md',
  text = 'Loading',
  fullScreen = false
}: LoadingProps) {
  const [dots, setDots] = useState("...")
  
  // Animated dots for text loading
  useEffect(() => {
    if (variant !== 'dots') return
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".")
    }, 500)
    
    return () => clearInterval(interval)
  }, [variant])
  
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50' 
    : 'flex flex-col items-center justify-center p-4'
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="loader-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
            {text && <p className="text-muted-foreground animate-pulse">{text}{dots}</p>}
          </div>
        )
        
      case 'spinner':
        return (
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className={`border-t-2 border-primary rounded-full ${sizeClass[size]}`}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
            {text && <p className="text-muted-foreground">{text}</p>}
          </div>
        )
        
      case 'pulse':
        return (
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className={`bg-primary rounded-full ${sizeClass[size]}`}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            {text && <p className="text-muted-foreground">{text}</p>}
          </div>
        )
        
      case 'glow':
        return (
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className={`bg-primary rounded-full ${sizeClass[size]}`}
              animate={{ 
                boxShadow: [
                  '0 0 0 0 rgba(var(--primary-rgb), 0.7)',
                  '0 0 0 10px rgba(var(--primary-rgb), 0)',
                  '0 0 0 0 rgba(var(--primary-rgb), 0)'
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut" 
              }}
            />
            {text && <p className="text-muted-foreground glow-text">{text}</p>}
          </div>
        )
      
      case 'skeleton':
        return (
          <div className="w-full max-w-md space-y-3">
            <div className="h-6 bg-muted rounded shimmer"></div>
            <div className="h-4 bg-muted rounded w-3/4 shimmer"></div>
            <div className="h-4 bg-muted rounded w-1/2 shimmer"></div>
            {text && <p className="text-muted-foreground text-center mt-4">{text}</p>}
          </div>
        )
        
      default:
        return (
          <div className="loader-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        )
    }
  }
  
  return (
    <div className={containerClass}>
      {renderLoader()}
    </div>
  )
} 