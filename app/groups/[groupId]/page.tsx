"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import ChannelList from "./components/ChannelList"
import GroupMembers from "./components/MembersList"

interface Group {
  id: string
  name: string
  description: string
  image: string | null
  isPrivate: boolean
  ownerId: string
  createdAt: string
  _count?: {
    members: number
  }
  owner: {
    id: string
    name: string | null
    image: string | null
  }
  members: {
    userId: string
    role: string
  }[]
}

export default function GroupDetailsPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const { data: session } = useSession()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Group not found")
          } else {
            setError("Failed to load group")
          }
          setLoading(false)
          return
        }
        
        const data = await response.json()
        setGroup(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching group:", err)
        setError("An error occurred while loading the group")
        setLoading(false)
      }
    }
    
    if (groupId) {
      fetchGroup()
    }
  }, [groupId])
  
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error || !group) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{error || "Group not found"}</h1>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    )
  }
  
  const isOwner = session?.user?.id === group.ownerId
  const isAdmin = group.members?.some(m => 
    m.userId === session?.user?.id && (m.role === "ADMIN" || m.role === "OWNER")
  )
  
  return (
    <div className="container max-w-7xl py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {group.image ? (
                <AvatarImage src={group.image} alt={group.name} />
              ) : (
                <AvatarFallback className="text-xl">{group.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-muted-foreground">{group._count?.members || 0} members</p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Link href={`/groups/${groupId}/settings`}>
                <Button variant="outline">Settings</Button>
              </Link>
              <Link href={`/groups/${groupId}/channels/create`}>
                <Button>Create Channel</Button>
              </Link>
            </div>
          )}
        </div>
        
        <p className="text-lg">{group.description}</p>
        
        <Separator />
        
        <Tabs defaultValue="channels" className="w-full">
          <TabsList>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <TabsContent value="channels">
            <ChannelList groupId={groupId} isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="members">
            <GroupMembers 
              groupId={groupId} 
              isAdmin={isAdmin} 
              isOwner={isOwner} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 