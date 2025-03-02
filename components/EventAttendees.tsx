"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Users, UserCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Attendee {
  id: string
  fullName: string
  rollNo: string
  user: {
    username: string
    image?: string
  }
  checkedIn: boolean
  checkedInAt?: string
}

interface EventRegistrationProps {
  eventId: string
  capacity: number
  registered: number
  deadline: string
}

interface EventStats {
  id: string
  title: string
  registered: number
  capacity: number
  checkedIn: number
  startDate: string
}

export function EventAttendees({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/attendees`)
        const data = await response.json()
        setAttendees(data)
      } catch (error) {
        console.error("Failed to fetch attendees:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [eventId])

  if (loading) {
    return <LoadingSpinner className="min-h-[200px]" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Event Attendees</span>
          <span className="text-sm font-normal text-muted-foreground">
            {attendees.filter(a => a.checkedIn).length}/{attendees.length} checked in
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Registered</TabsTrigger>
            <TabsTrigger value="checked">Checked In</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <motion.div className="space-y-4">
              <AnimatePresence>
                {attendees.map((attendee) => (
                  <motion.div
                    key={attendee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={attendee.user.image} />
                        <AvatarFallback>{attendee.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.fullName}</p>
                        <p className="text-sm text-muted-foreground">@{attendee.user.username}</p>
                        <p className="text-sm text-muted-foreground">Roll: {attendee.rollNo}</p>
                      </div>
                    </div>
                    {attendee.checkedIn ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="checked">
            <motion.div className="space-y-4">
              <AnimatePresence>
                {attendees.filter(a => a.checkedIn).map((attendee) => (
                  <motion.div
                    key={attendee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={attendee.user.image} />
                        <AvatarFallback>{attendee.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.fullName}</p>
                        <p className="text-sm text-muted-foreground">@{attendee.user.username}</p>
                        <p className="text-sm text-muted-foreground">Roll: {attendee.rollNo}</p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 