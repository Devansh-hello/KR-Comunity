"use client"

import { ButtonHTMLAttributes, forwardRef, useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cva, type VariantProps } from "class-variance-authority"

const glowButtonVariants = cva(
  "relative overflow-hidden rounded-md inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary/10",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground border-secondary/10",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline bg-transparent",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
      glow: {
        default: "after:absolute after:inset-0 after:z-[-1] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:bg-gradient-to-r after:from-primary/30 after:via-primary/0 after:to-primary/30 after:blur-xl",
        intense: "after:absolute after:inset-0 after:z-[-1] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:bg-gradient-to-r after:from-primary/50 after:via-primary/20 after:to-primary/50 after:blur-xl",
        subtle: "after:absolute after:inset-0 after:z-[-1] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:bg-gradient-to-r after:from-primary/20 after:via-primary/0 after:to-primary/20 after:blur-md",
        pulse: "after:absolute after:inset-0 after:z-[-1] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:bg-primary/20 after:blur-xl after:animate-pulse",
        none: "",
      },
      effect: {
        default: "",
        shine: "shine-effect",
        rotate: "group",
        scale: "hover:scale-[1.03] active:scale-[0.97] transition-transform",
        lift: "hover:-translate-y-1 active:translate-y-0 transition-transform",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "default",
      effect: "default",
    },
  }
)

export interface GlowButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  children: React.ReactNode
  asChild?: boolean
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, glow, effect, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    
    const shineEffectStyles = effect === "shine" ? {
      position: "relative" as const,
      overflow: "hidden" as const,
    } : {}
    
    return (
      <Button
        className={cn(glowButtonVariants({ variant, size, glow, effect, className }))}
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Rotating background effect */}
        {effect === "rotate" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/0 to-primary/20 rounded-md z-0 opacity-0 group-hover:opacity-100"
            animate={
              isHovered
                ? { rotate: 360 }
                : { rotate: 0 }
            }
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        
        {/* Shine effect */}
        {effect === "shine" && isHovered && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
              width: "50%"
            }}
          />
        )}
        
        <div className="relative z-10">
          {children}
        </div>
      </Button>
    )
  }
)

GlowButton.displayName = "GlowButton"

export { GlowButton } 