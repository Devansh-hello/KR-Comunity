"use client"

import { useState, useEffect, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { TiltCard } from "@/components/ui/lighting-effects"

const cardVariants = cva(
  "transition-all duration-300 overflow-hidden relative group",
  {
    variants: {
      variant: {
        default: "bg-card border border-border hover:border-primary/20",
        featured: "bg-gradient-to-br from-card to-card/90 border border-border hover:border-primary/40 shadow-lg",
        ghost: "bg-background/50 backdrop-blur-sm hover:bg-background/70",
        outline: "bg-background border border-border hover:border-primary/50",
        premium: "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50"
      },
      hover: {
        default: "hover-lift",
        glow: "hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]",
        scale: "hover:scale-[1.02]",
        spotlight: "group overflow-hidden",
        none: ""
      },
      animation: {
        default: "",
        fadeIn: "animate-fadeIn",
        slideUp: "animate-slideUp",
        pulse: "animate-pulse",
        none: ""
      }
    },
    defaultVariants: {
      variant: "default",
      hover: "default",
      animation: "fadeIn"
    }
  }
)

export interface AnimatedCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title?: string
  description?: string
  footer?: ReactNode
  isLoading?: boolean
  withTilt?: boolean
  tiltIntensity?: number
  withShine?: boolean
}

export function AnimatedCard({
  children,
  className,
  title,
  description,
  footer,
  variant,
  hover,
  animation,
  isLoading,
  withTilt = false,
  tiltIntensity = 5,
  withShine = false,
  ...props
}: AnimatedCardProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Shimmer effect styles
  const shimmerStyles = withShine ? {
    overflow: "hidden",
    position: "relative" as const,
    "&::after": {
      content: '""',
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      transform: "translateX(-100%)",
      animation: "shine 1.5s infinite"
    }
  } : {}
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)} {...props}>
        {title && (
          <CardHeader>
            <div className="h-6 w-3/4 bg-muted rounded-md"></div>
            {description && <div className="h-4 w-1/2 bg-muted rounded-md mt-2"></div>}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md"></div>
            <div className="h-4 bg-muted rounded-md w-3/4"></div>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
          </div>
        </CardContent>
        {footer && (
          <CardFooter>
            <div className="h-8 w-1/3 bg-muted rounded-md"></div>
          </CardFooter>
        )}
      </Card>
    )
  }
  
  // Server-side rendering safety
  if (!isMounted) {
    return (
      <Card className={className} {...props}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    )
  }
  
  // Animated card component with all fancy effects
  const cardComponent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        className={cn(cardVariants({ variant, hover, animation }), className)} 
        {...props}
      >
        {withShine && (
          <div className="absolute inset-0 shine-effect pointer-events-none z-10" />
        )}
        
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent>{children}</CardContent>
        
        {footer && <CardFooter>{footer}</CardFooter>}
        
        {/* Spotlight effect for hover variant "spotlight" */}
        {hover === "spotlight" && (
          <div className="absolute inset-0 z-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-primary/10 via-transparent to-transparent pointer-events-none" />
        )}
      </Card>
    </motion.div>
  )
  
  // Wrap with tilt effect if enabled
  return withTilt 
    ? <TiltCard intensity={tiltIntensity}>{cardComponent}</TiltCard>
    : cardComponent
} 