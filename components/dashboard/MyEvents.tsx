"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Event {
  id: string
  title: string
  capacity: number
  registered: number
  deadline: string
  checkedIn: number
}

export function MyEvents() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  useEffect(() => {
    console.log("Session in MyEvents component:", session)
    if (session?.user?.id) {
      fetchEvents()
    }
  }, [session])

  async function fetchEvents() {
    try {
      console.log("Fetching events for user:", session?.user?.id)
      const response = await fetch("/api/user/events")
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        throw new Error(errorData.message || errorData.error || "Failed to fetch events")
      }
      
      const data = await response.json()
      console.log("Fetched events:", data)
      
      if (Array.isArray(data)) {
        setEvents(data)
      } else {
        console.error("Unexpected data format:", data)
        setError("Received invalid data from the server")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError(error instanceof Error ? error.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    setDeletingEventId(eventId)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh the events list after deletion
        fetchEvents()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      setError("Failed to delete event")
    } finally {
      setDeletingEventId(null)
    }
  }

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
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
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
                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/events/${event.id}`}>View</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/events/edit/${event.id}`} className="flex items-center">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            event and all associated registrations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(event.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingEventId === event.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CardContent>
  )
} 