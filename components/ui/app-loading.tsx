"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { usePathname, useSearchParams } from 'next/navigation'

export function AppLoading() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  // Set loading state when navigation occurs
  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 500) // Delay hiding loader for visual effect
    }
    
    // Add event listeners for route changes
    // Here we simulate router events since we don't have direct access to Next.js router events
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
    
    // Track navigation changes to trigger loading state
    return () => {
      // Clean up any event listeners if needed
    }
  }, [pathname, searchParams])
  
  if (!isLoading) return null
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative w-20 h-20">
          {/* Outer spinning circle */}
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner spinning circle */}
          <motion.div
            className="absolute inset-2 rounded-full border-t-2 border-r-2 border-primary/70"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Pulsing dot in the middle */}
          <motion.div
            className="absolute inset-0 m-auto w-4 h-4 bg-primary rounded-full"
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
        </div>
        
        <motion.div 
          className="mt-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading...
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 