"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

function EventCard({ event }: { event: Event }) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch (e) {
      return 'Invalid date'
    }
  }
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="w-full aspect-[16/9] relative overflow-hidden bg-black/5">
        <Image
          src={event.image || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
        <div className="absolute top-2 right-2">
          <div className="bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
            {event.category}
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{formatDate(event.deadline)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>{event.registered}/{event.capacity}</span>
          </div>
        </div>
        <div className="text-xs text-right text-muted-foreground">
          By {event.author?.name || "Anonymous"}
        </div>
      </CardContent>
    </Card>
  )
}

interface Event {
  id: string
  title: string
  content: string
  category: string
  location: string
  deadline: string
  capacity: number
  registered: number
  image?: string
  author?: {
    name: string
  }
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        console.log("Fetching upcoming events...")
        const response = await fetch('/api/events/upcoming')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch events')
        }
        
        const data = await response.json()
        console.log("Received events data:", data)
        
        if (Array.isArray(data)) {
          setEvents(data)
        } else {
          console.error("Unexpected data format:", data)
          throw new Error('Received invalid data format')
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        setError(error instanceof Error ? error.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
          <p className="text-muted-foreground mt-1">Discover events happening soon in your community</p>
        </div>
        <Button asChild>
          <Link href="/events">View All Events</Link>
        </Button>
      </div>
      
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse h-full">
              <div className="aspect-[16/9] bg-muted"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/events/${event.id}`} className="block h-full">
                <EventCard event={event} />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/10 rounded-lg border border-border">
          <div className="text-muted-foreground mb-4">No upcoming events found</div>
          <Button asChild variant="outline">
            <Link href="/events/create">Create an Event</Link>
          </Button>
        </div>
      )}
    </div>
  )
} 