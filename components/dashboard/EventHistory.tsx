"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"

interface Registration {
  id: string
  event: {
    id: string
    title: string
    startDate: string
    location: string
  }
  createdAt: string
}

export function EventHistory() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const response = await fetch("/api/user/registrations")
        if (!response.ok) throw new Error("Failed to fetch registrations")
        const data = await response.json()
        setRegistrations(data)
      } catch (error) {
        console.error("Error fetching registrations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!registrations?.length) {
    return (
      <Card>
        <CardContent className="p-4">
          No event registrations found
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{reg.event.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(reg.event.startDate)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="mr-1 h-4 w-4" />
                      {reg.event.location}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    Registered on {formatDate(reg.createdAt)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
} 