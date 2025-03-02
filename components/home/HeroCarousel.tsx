"use client"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Event {
  id: string
  title: string
  content: string
  image: string
  deadline: string
}

export function HeroCarousel() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events/latest')
      .then(res => res.json())
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching events:", error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((current) => (current + 1) % events.length)
      }, 10000) // Change slide every 10 seconds

      return () => clearInterval(timer)
    }
  }, [events.length])

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) => (current + 1) % events.length)
  }, [events.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((current) => (current - 1 + events.length) % events.length)
  }, [events.length])

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-10 bg-muted rounded w-1/4"></div>
            </div>
            <div className="aspect-video bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!events.length) {
    return null
  }

  return (
    <div className="relative group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                      Latest Event
                    </span>
                  </motion.div>
                  <motion.h1
                    className="text-3xl font-bold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {events[currentIndex].title}
                  </motion.h1>
                  <motion.p
                    className="text-muted-foreground"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {events[currentIndex].content}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button size="lg" asChild>
                      <Link href={`/events/${events[currentIndex].id}`}>
                        Register Now
                      </Link>
                    </Button>
                  </motion.div>
                </div>
                <motion.div
                  className="relative aspect-video rounded-lg overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Image
                    src={events[currentIndex].image || "/placeholder.svg"}
                    alt="Event banner"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? "bg-primary w-4" : "bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
} 