"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Event {
  id: string
  title: string
  capacity: number
  registered: number
  startDate: string
  checkedIn: number
}

export function EventDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/user/events")
        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }
        const data = await response.json()
        setEvents(Array.isArray(data) ? data : [])
      } catch (err) {
        setError("Failed to load events")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {events && events.length > 0 ? (
          events.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.02 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Registered: {event.registered}/{event.capacity}</p>
                  <p>Checked In: {event.checkedIn}</p>
                  <p>Start Date: {new Date(event.startDate).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p>No events found</p>
        )}
      </div>
    </div>
  )
} 