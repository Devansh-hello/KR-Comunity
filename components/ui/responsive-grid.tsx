"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: "none" | "sm" | "md" | "lg"
  withAnimation?: boolean
  staggerChildren?: boolean
  staggerDelay?: number
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = "md",
  withAnimation = true,
  staggerChildren = true,
  staggerDelay = 0.1
}: ResponsiveGridProps) {
  // Calculate grid columns for responsive sizes
  const getGridCols = () => {
    const { default: defaultCols, sm, md, lg, xl } = cols
    
    return cn(
      `grid-cols-${defaultCols}`,
      sm && `sm:grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`
    )
  }
  
  // Grid gap classes
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2 md:gap-4",
    md: "gap-4 md:gap-6",
    lg: "gap-6 md:gap-8"
  }
  
  // Grid class combining responsive cols and gap
  const gridClass = cn(
    "grid w-full",
    getGridCols(),
    gapClasses[gap],
    className
  )
  
  // Animation variants for grid container and items
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerChildren ? staggerDelay : 0
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }
  
  // Wrap children in motion.div with variants if animation is enabled
  const getAnimatedChildren = () => {
    return React.Children.map(children, (child, index) => {
      return (
        <motion.div 
          key={index} 
          variants={itemVariants}
          className="h-full"
        >
          {child}
        </motion.div>
      )
    })
  }
  
  if (withAnimation) {
    return (
      <motion.div
        className={gridClass}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {getAnimatedChildren()}
      </motion.div>
    )
  }
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  )
} 