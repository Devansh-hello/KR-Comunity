"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"

interface Registration {
  id: string
  fullName: string
  rollNo: string
  checkedIn: boolean
  checkedInAt: string | null
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

interface Event {
  id: string
  title: string
  capacity: number
  registered: number
  checkedInCount: number
}

export default function MobileCheckInPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/sign-in?callbackUrl=/events/${eventId}/check-in/mobile`)
      return
    }

    if (status !== "loading") {
      fetchEventAndRegistrations()
    }
  }, [eventId, status, router])

  const fetchEventAndRegistrations = async () => {
    try {
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) {
        throw new Error("Failed to fetch event")
      }
      const eventData = await eventResponse.json()
      
      // Check if user is the event author
      if (eventData.author.id !== (session?.user as any).id) {
        setError("You are not authorized to manage check-ins for this event")
        return
      }
      
      // Fetch registrations
      const registrationsResponse = await fetch(`/api/events/${eventId}/registrations`)
      if (!registrationsResponse.ok) {
        throw new Error("Failed to fetch registrations")
      }
      const registrationsData = await registrationsResponse.json()
      
      setEvent({
        id: eventData.id,
        title: eventData.title,
        capacity: eventData.capacity,
        registered: eventData._count.registrations,
        checkedInCount: registrationsData.filter((r: Registration) => r.checkedIn).length
      })
      setRegistrations(registrationsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load event data")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (registrationId: string, currentStatus: boolean) => {
    setProcessing(registrationId)
    
    try {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registrationId,
          checkIn: !currentStatus
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update check-in status")
      }
      
      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId
            ? { ...reg, checkedIn: !currentStatus, checkedInAt: !currentStatus ? new Date().toISOString() : null }
            : reg
        )
      )
      
      // Update event stats
      if (event) {
        setEvent(prev => {
          if (!prev) return prev
          return {
            ...prev,
            checkedInCount: prev.checkedInCount + (currentStatus ? -1 : 1)
          }
        })
      }
      
      toast({
        title: "Check-in Status Updated",
        description: `Successfully ${!currentStatus ? "checked in" : "checked out"} participant.`
      })
    } catch (error: any) {
      console.error("Check-in error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update check-in status",
        variant: "destructive"
      })
    } finally {
      setProcessing(null)
    }
  }

  const filteredRegistrations = registrations.filter(reg =>
    reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto py-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <CardTitle>Check-in Error</CardTitle>
            <CardDescription>
              {error || "Event not found"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/events">Back to Events</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>
              <div className="flex flex-col space-y-1">
                <p>Registered: {event.registered} / {event.capacity}</p>
                <p>Checked in: {event.checkedInCount}</p>
              </div>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="space-y-2">
              {filteredRegistrations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {searchTerm ? "No matching registrations found" : "No registrations yet"}
                </p>
              ) : (
                filteredRegistrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div>
                          <p className="font-medium">{registration.fullName}</p>
                          <p className="text-sm text-muted-foreground">{registration.rollNo}</p>
                          {registration.checkedIn && registration.checkedInAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Checked in at: {new Date(registration.checkedInAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant={registration.checkedIn ? "destructive" : "default"}
                          onClick={() => handleCheckIn(registration.id, registration.checkedIn)}
                          disabled={processing === registration.id}
                          className="w-full"
                        >
                          {processing === registration.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : registration.checkedIn ? (
                            "Check Out"
                          ) : (
                            "Check In"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 