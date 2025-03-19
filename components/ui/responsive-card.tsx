"use client"

import React, { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin } from "lucide-react"

// TiltCard component for adding a tilt effect on hover
const TiltCard = ({ 
  children, 
  className,
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const [tiltAngle, setTiltAngle] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const tiltX = (y - centerY) / 30
    const tiltY = -(x - centerX) / 30
    
    setTiltAngle({ x: tiltX, y: tiltY })
  }

  return (
    <div
      className={cn("w-full h-full relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setTiltAngle({ x: 0, y: 0 })
      }}
      style={{
        transform: `perspective(1000px) rotateX(${tiltAngle.x}deg) rotateY(${tiltAngle.y}deg)`,
        transition: 'transform 0.1s ease'
      }}
      {...props}
    >
      {children}
    </div>
  )
}

interface ResponsiveCardProps {
  title: string
  description: string
  image?: string
  href?: string
  date?: string
  location?: string
  category?: string
  withAnimation?: boolean
  withTilt?: boolean
  className?: string
}

export function ResponsiveCard({
  title,
  description,
  image,
  href,
  date,
  location,
  category,
  withAnimation = false,
  withTilt = false,
  className,
}: ResponsiveCardProps) {
  const CardWrapper = withAnimation ? motion.div : React.Fragment
  const animationProps = withAnimation 
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.4 }
      } 
    : {}
  
  const content = (
    <Card className={cn(
      "h-full overflow-hidden bg-card border transition-all duration-200",
      withTilt ? "hover:shadow-lg" : "hover:border-primary/50",
      className
    )}>
      {image && (
        <div className="relative w-full pt-[56.25%] overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {category && (
            <Badge className="absolute top-3 right-3 text-xs font-medium" variant="secondary">
              {category}
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-5">
        <h3 className="text-xl font-semibold line-clamp-2 mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{description}</p>
        
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span>{date}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 border-t bg-muted/30">
        <div className="text-sm text-primary font-medium">View Details</div>
      </CardFooter>
    </Card>
  )

  const cardElement = withTilt ? (
    <TiltCard className="h-full">
      {content}
    </TiltCard>
  ) : content

  // Wrap with animation if needed
  const card = withAnimation ? (
    <CardWrapper {...animationProps} className="h-full">
      {cardElement}
    </CardWrapper>
  ) : (
    cardElement
  )

  // Wrap with link if href is provided
  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    )
  }

  return card
} 