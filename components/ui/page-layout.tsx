"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShimmerEffect, SpotlightEffect } from "@/components/ui/lighting-effects"
import { ResponsiveContainer } from "@/components/ui/responsive-container"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  image?: string
  date?: string
  time?: string
  location?: string
  category?: string
  backUrl?: string
  backLabel?: string
  withAnimation?: boolean
  withSpotlight?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageLayout({
  children,
  title,
  description,
  image,
  date,
  time,
  location,
  category,
  backUrl = "/",
  backLabel = "Back",
  withAnimation = true,
  withSpotlight = false,
  className,
  headerClassName,
  contentClassName
}: PageLayoutProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }
  
  // Header content with hero image and title
  const renderHeader = () => {
    const headerContent = (
      <div className={cn(
        "w-full py-8 md:py-12 lg:py-16",
        image ? "text-white" : "",
        headerClassName
      )}>
        {/* Back button */}
        {backUrl && (
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className={cn(
                "hover-lift",
                image ? "bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-black/40 hover:text-white" : ""
              )}
            >
              <Link href={backUrl}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </motion.div>
        )}
        
        <div className="max-w-4xl">
          {/* Category label */}
          {category && (
            <motion.div 
              className="mb-4"
              variants={itemVariants}
            >
              <div className={cn(
                "inline-block px-3 py-1 text-sm font-medium rounded-full",
                image ? "bg-primary/30 backdrop-blur-sm text-white" : "bg-primary/10 text-primary"
              )}>
                <ShimmerEffect className="px-2">
                  {category}
                </ShimmerEffect>
              </div>
            </motion.div>
          )}
          
          {/* Title */}
          <motion.div 
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight",
              image ? "glow-text" : ""
            )}
            variants={itemVariants}
          >
            <h1>{title}</h1>
          </motion.div>
          
          {/* Description */}
          {description && (
            <motion.div 
              className={cn(
                "text-base md:text-lg max-w-3xl mb-6",
                image ? "text-white/90" : "text-muted-foreground"
              )}
              variants={itemVariants}
            >
              <p>{description}</p>
            </motion.div>
          )}
          
          {/* Meta info (date, time, location) */}
          {(date || time || location) && (
            <motion.div 
              className={cn(
                "flex flex-wrap gap-4 text-sm",
                image ? "text-white/80" : "text-muted-foreground"
              )}
              variants={itemVariants}
            >
              {date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{date}</span>
                </div>
              )}
              
              {time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{time}</span>
                </div>
              )}
              
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{location}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    )
    
    return (
      <header className={cn(
        "relative w-full overflow-hidden",
        image ? "mb-8 md:mb-12 rounded-xl" : "mb-4 md:mb-8"
      )}>
        {image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 noise-bg" />
          </div>
        )}
        
        <div className="relative z-10">
          <ResponsiveContainer>
            {headerContent}
          </ResponsiveContainer>
        </div>
      </header>
    )
  }
  
  // Main content area
  const renderContent = () => (
    <main className={cn("pb-10 md:pb-16", contentClassName)}>
      <ResponsiveContainer>
        {withAnimation ? (
          <motion.div 
            variants={itemVariants}
            className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed max-w-4xl"
          >
            {children}
          </motion.div>
        ) : (
          <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed max-w-4xl">
            {children}
          </div>
        )}
      </ResponsiveContainer>
    </main>
  )
  
  // Responsive spotlight wrapper or regular layout
  if (withSpotlight) {
    return (
      <SpotlightEffect 
        className={cn("w-full", className)} 
        size="70rem"
        strength={0.1}
      >
        {withAnimation ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {renderHeader()}
            {renderContent()}
          </motion.div>
        ) : (
          <>
            {renderHeader()}
            {renderContent()}
          </>
        )}
      </SpotlightEffect>
    )
  }
  
  return (
    <div className={cn("w-full", className)}>
      {withAnimation ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {renderHeader()}
          {renderContent()}
        </motion.div>
      ) : (
        <>
          {renderHeader()}
          {renderContent()}
        </>
      )}
    </div>
  )
} 