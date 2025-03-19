"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { SpotlightEffect } from "@/components/ui/lighting-effects"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  withPadding?: boolean
  withSpotlight?: boolean
  spotlightSize?: string
  withAnimation?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "full": "max-w-full"
}

export function ResponsiveContainer({
  children,
  className,
  fullWidth = false,
  withPadding = true,
  withSpotlight = false,
  spotlightSize = "50rem",
  withAnimation = true,
  maxWidth = "xl",
  ...props
}: ResponsiveContainerProps) {
  // Base container styling
  const containerClasses = cn(
    "w-full relative",
    !fullWidth && maxWidthClasses[maxWidth],
    !fullWidth && "mx-auto",
    withPadding && "px-4 md:px-6 lg:px-8",
    className
  )
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }
  
  const contentVariants = {
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
  
  // Render with spotlight effect if enabled
  if (withSpotlight) {
    return (
      <SpotlightEffect
        className={containerClasses}
        size={spotlightSize}
        strength={0.15}
        {...props}
      >
        {withAnimation ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full"
          >
            <motion.div variants={contentVariants}>
              {children}
            </motion.div>
          </motion.div>
        ) : (
          children
        )}
      </SpotlightEffect>
    )
  }
  
  // Render with just animations if spotlight not enabled
  return (
    <div className={containerClasses} {...props}>
      {withAnimation ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={contentVariants}>
            {children}
          </motion.div>
        </motion.div>
      ) : (
        children
      )}
    </div>
  )
} 