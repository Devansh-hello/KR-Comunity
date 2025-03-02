"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

interface Event {
  id: string
  title: string
  content: string
  location: string
  deadline: string
  capacity: number
  registered: number
  image?: string
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events/upcoming')
      .then(res => res.json())
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        <Button asChild variant="outline">
          <Link href="/events">View All</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.deadline).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.registered}/{event.capacity} registered
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
} 