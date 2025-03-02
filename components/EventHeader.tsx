"use client"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EventHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export function EventHeader({ title, subtitle, showBack, action }: EventHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center px-4">
        {showBack && (
          <Button variant="ghost" size="icon" asChild className="mr-2 md:mr-4">
            <Link href="/events">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        
        <div className="flex-1">
          <h1 className="text-lg md:text-2xl font-bold gradient-text line-clamp-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground hidden md:block">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <Button 
            onClick={action.onClick}
            className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>
    </motion.div>
  )
} 