"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { SpotlightEffect, ShimmerEffect } from "@/components/ui/lighting-effects"
import { Loading } from "@/components/ui/loading"

interface FeaturedEventType {
  id: string
  title: string
  content: string
  location: string
  deadline: string
  category: string
}

export function FeaturedEvent() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [events, setEvents] = useState<FeaturedEventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events/latest')
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data)
        } else {
          // If no events from API, use hardcoded fallback
          setEvents([{
            id: "roborush",
            title: "ROBORUSH 1.0 – WHERE TECHNOLOGY MEETS INNOVATION!",
            content: "Techies, gear up for ROBORUSH 1.0 – a high-speed, high-energy Robot Race & Project Showcase where innovation meets adrenaline! Robot Race – hit the track, and race to victory! Speed, control, and precision are all that matter!",
            location: "Moot Court",
            deadline: "2025-04-26T00:00:00.000Z",
            category: "TECHNICAL"
          }])
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        // Use fallback data in case of error
        setEvents([{
          id: "roborush",
          title: "ROBORUSH 1.0 – WHERE TECHNOLOGY MEETS INNOVATION!",
          content: "Techies, gear up for ROBORUSH 1.0 – a high-speed, high-energy Robot Race & Project Showcase where innovation meets adrenaline! Robot Race – hit the track, and race to victory! Speed, control, and precision are all that matter!",
          location: "Moot Court",
          deadline: "2025-04-26T00:00:00.000Z",
          category: "TECHNICAL"
        }])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const nextSlide = () => {
    if (events.length <= 1 || isTransitioning) return
    setIsTransitioning(true)
    
    // Delay the actual slide change to allow for the transition effect
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
      setTimeout(() => setIsTransitioning(false), 100)
    }, 300)
  }

  const prevSlide = () => {
    if (events.length <= 1 || isTransitioning) return
    setIsTransitioning(true)
    
    // Delay the actual slide change to allow for the transition effect
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
      setTimeout(() => setIsTransitioning(false), 100)
    }, 300)
  }

  // Auto rotate slides
  useEffect(() => {
    if (events.length <= 1) return
    
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide()
      }
    }, 10000) // Change slide every 10 seconds
    
    return () => clearInterval(interval)
  }, [events.length, isTransitioning])

  if (loading) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black/90 text-white h-[450px] flex items-center justify-center">
        <Loading variant="glow" size="lg" text="Discovering amazing events" />
      </div>
    )
  }

  if (events.length === 0) {
    return null // Don't show anything if no events
  }

  const event = events[currentIndex]
  const formattedDate = new Date(event.deadline).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="relative rounded-xl overflow-hidden h-[450px] group">
      {/* Carousel Container */}
      <SpotlightEffect 
        className={`h-full transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        size="70rem"
        strength={0.2}
        key={currentIndex}
      >
        {/* Event Card - Clickable */}
        <Link href={`/events/${event.id}`} className="block h-full">
          <div className="relative bg-black text-white overflow-hidden h-full noise-bg">
            {/* Animated gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary/10 opacity-70" />
            
            {/* Content */}
            <div className="px-8 py-8 h-full flex flex-col justify-center max-w-4xl">
              <motion.div 
                className="space-y-3 flex flex-col h-[370px] justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                <div className="flex flex-col space-y-4">
                  <motion.div 
                    className="inline-block text-primary bg-primary/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm self-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <ShimmerEffect className="px-2">
                      {event.category}
                    </ShimmerEffect>
                  </motion.div>
                  
                  <motion.div 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight glow-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {event.title}
                  </motion.div>
                </div>
                
                <motion.div 
                  className="text-white/80 text-base md:text-lg leading-relaxed line-clamp-2 max-w-3xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {event.content}
                </motion.div>
                
                <div className="flex flex-col space-y-6">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-white/90">Date: {formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-white/90">Venue: {event.location}</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-2"
                  >
                    <Button 
                      className="relative z-10 bg-primary hover:bg-primary/90 text-white hover-lift neon-border min-h-10 h-auto py-2"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault() // Prevent the Link above from triggering
                        window.location.href = `/events/${event.id}/register`
                      }}
                    >
                      Register Now
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </Link>
      </SpotlightEffect>
      
      {/* Navigation Buttons with improved styling */}
      {events.length > 1 && (
        <>
          <motion.button 
            onClick={prevSlide} 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-primary/60 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          <motion.button 
            onClick={nextSlide} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-primary/60 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </>
      )}
      
      {/* Indicator Dots with animation */}
      {events.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {events.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all ${
                index === currentIndex 
                  ? "w-6 h-1.5 bg-primary glow-border" 
                  : "w-1.5 h-1.5 bg-white/30"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 