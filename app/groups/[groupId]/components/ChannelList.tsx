"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Hash, Volume2, Megaphone, MessageSquare } from "lucide-react"
import Link from "next/link"

interface Channel {
  id: string
  name: string
  description: string | null
  type: "TEXT" | "VOICE" | "ANNOUNCEMENT"
  groupId: string
  createdAt: string
}

interface ChannelListProps {
  groupId: string
  isAdmin: boolean
}

export default function ChannelList({ groupId, isAdmin }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/channels`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch channels")
        }
        
        const data = await response.json()
        setChannels(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching channels:", err)
        setError("Failed to load channels")
        setLoading(false)
      }
    }
    
    fetchChannels()
  }, [groupId])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted-foreground">No channels found</p>
        {isAdmin && (
          <Link href={`/groups/${groupId}/channels/create`}>
            <Button>Create a Channel</Button>
          </Link>
        )}
      </div>
    )
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <Hash className="h-5 w-5 mr-2" />
      case "VOICE":
        return <Volume2 className="h-5 w-5 mr-2" />
      case "ANNOUNCEMENT":
        return <Megaphone className="h-5 w-5 mr-2" />
      default:
        return <MessageSquare className="h-5 w-5 mr-2" />
    }
  }

  return (
    <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => (
        <Link key={channel.id} href={`/groups/${groupId}/channels/${channel.id}`}>
          <Card className="h-full cursor-pointer hover:bg-muted/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                {getChannelIcon(channel.type)}
                <CardTitle className="text-lg">{channel.name}</CardTitle>
              </div>
              <CardDescription>
                {channel.type === "TEXT" ? "Text Channel" : 
                 channel.type === "VOICE" ? "Voice Channel" : "Announcement Channel"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {channel.description || "No description."}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 