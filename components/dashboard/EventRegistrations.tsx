"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Download, Search, CheckCircle2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// Types
interface Event {
  id: string
  title: string
  capacity: number
  _count: {
    registrations: number
  }
}

interface Registration {
  id: string
  fullName: string
  rollNo: string
  createdAt: string
  checkedIn: boolean
  checkedInAt: string | null
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export function EventRegistrations() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingCheckin, setLoadingCheckin] = useState(false)

  // Fetch user's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/user/events")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()
        setEvents(data)
        // Set the first event as selected by default if available
        if (data.length > 0) {
          setSelectedEvent(data[0].id)
          fetchRegistrations(data[0].id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        toast.error("Failed to load your events")
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fetch registrations for selected event
  const fetchRegistrations = async (eventId: string) => {
    if (!eventId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`)
      if (!response.ok) throw new Error("Failed to fetch registrations")
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast.error("Failed to load registrations")
    } finally {
      setLoading(false)
    }
  }

  // Handle event selection change
  const handleEventChange = (value: string) => {
    setSelectedEvent(value)
    fetchRegistrations(value)
  }

  // Toggle check-in status
  const toggleCheckIn = async (registrationId: string, currentStatus: boolean) => {
    setLoadingCheckin(true)
    try {
      const response = await fetch(`/api/events/registrations/${registrationId}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ checkedIn: !currentStatus })
      })
      
      if (!response.ok) throw new Error("Failed to update check-in status")
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { 
                ...reg, 
                checkedIn: !currentStatus, 
                checkedInAt: !currentStatus ? new Date().toISOString() : null 
              } 
            : reg
        )
      )
      
      toast.success(`${currentStatus ? "Check-out" : "Check-in"} successful`)
    } catch (error) {
      console.error("Error updating check-in status:", error)
      toast.error("Failed to update check-in status")
    } finally {
      setLoadingCheckin(false)
    }
  }

  // Export registrations as CSV
  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast.error("No registrations to export")
      return
    }

    const selectedEventTitle = events.find(e => e.id === selectedEvent)?.title || "Event"
    const csvHeader = ["Name", "Roll Number", "Email", "Registered On", "Checked In", "Check-in Time"]
    const csvData = registrations.map(reg => [
      reg.fullName,
      reg.rollNo,
      reg.user.email || "N/A",
      format(new Date(reg.createdAt), "yyyy-MM-dd HH:mm"),
      reg.checkedIn ? "Yes" : "No",
      reg.checkedInAt ? format(new Date(reg.checkedInAt), "yyyy-MM-dd HH:mm") : "N/A"
    ])
    
    const csvContent = [
      csvHeader.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedEventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(reg => {
    const searchLower = searchQuery.toLowerCase()
    return (
      reg.fullName.toLowerCase().includes(searchLower) ||
      reg.rollNo.toLowerCase().includes(searchLower) ||
      (reg.user.email && reg.user.email.toLowerCase().includes(searchLower))
    )
  })

  // Get the selected event data
  const selectedEventData = events.find(e => e.id === selectedEvent)

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle>Event Registrations</CardTitle>
        <CardDescription>
          View and manage registrations for your events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">You have not created any events yet</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => window.location.href = "/events/create"}
            >
              Create an Event
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-64">
                  <Select 
                    value={selectedEvent} 
                    onValueChange={handleEventChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEventData && (
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline">
                      {selectedEventData._count.registrations} / {selectedEventData.capacity} registered
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, roll no, or email"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCSV}
                  disabled={registrations.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading registrations...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No registrations found for this event</p>
                </div>
              ) : (
                <div className="rounded-md border mt-4 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Registered On</TableHead>
                        <TableHead>Check-in Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">{registration.fullName}</TableCell>
                          <TableCell>{registration.rollNo}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {registration.user.email || "N/A"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(registration.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {registration.checkedIn ? (
                              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Checked In
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Not Checked In
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCheckIn(registration.id, registration.checkedIn)}
                              disabled={loadingCheckin}
                            >
                              {registration.checkedIn ? "Check-out" : "Check-in"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 