"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Calendar, MapPin, Users } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"

interface Event {
  id: string
  title: string
  content: string
  category: "ACADEMIC" | "CULTURAL" | "SPORTS" | "TECHNICAL" | "OTHER"
  capacity: number
  registered: number
  deadline: string
  startDate: string
  endDate: string
  location: string
  qrCode?: string
  image?: string
}

export default function EventsPage() {
  const { data: session } = useSession()
  const [category, setCategory] = useState<string>("all")
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  const handleCreateEvent = () => {
    if (!session) {
      window.location.href = '/signin'
      return
    }
    // Navigate to event creation page
    window.location.href = '/events/create'
  }

  const filteredEvents = events.filter(event => 
    category === "all" ? true : event.category === category
  )

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover and join upcoming events
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/events/create">Create Event</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search events..."
            className="w-full"
            prefix={<Search className="w-4 h-4 text-muted-foreground" />}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ACADEMIC">Academic</SelectItem>
            <SelectItem value="CULTURAL">Cultural</SelectItem>
            <SelectItem value="SPORTS">Sports</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          // Loading skeleton
          Array(6).fill(0).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">{event.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.registered} attending
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No events found
          </div>
        )}
      </motion.div>
    </div>
  )
}

