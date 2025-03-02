"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Event {
  id: string
  title: string
  capacity: number
  registered: number
  deadline: string
  checkedIn: number
}

export function MyEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/user/events")
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to fetch events")
        }
        const data = await response.json()
        console.log("Fetched events:", data) // Debug log
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
        setError("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <CardContent className="p-4">
        <div className="flex items-center justify-center h-32">
          Loading...
        </div>
      </CardContent>
    )
  }

  return (
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Events</h2>
        <Button asChild>
          <Link href="/events/create">Create Event</Link>
        </Button>
      </div>
      
      {error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">You haven't created any events yet</p>
          <Button asChild>
            <Link href="/events/create">Create Your First Event</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Registration deadline: {formatDate(event.deadline)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registered: {event.registered} / {event.capacity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Checked in: {event.checkedIn || 0}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CardContent>
  )
} 