"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Lock, Search, Users, UserPlus, UserMinus, Shield } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useGroups } from "@/lib/hooks"
import { toast } from "sonner"

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  isPrivate: boolean
  image?: string
  owner: {
    name: string
    image?: string
  }
  members: {
    userId: string
  }[]
}

export default function GroupsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const { groups, loading, error } = useGroups(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by the hook automatically
  }

  const handleJoinGroup = async (groupId: string) => {
    if (!session) {
      window.location.href = '/signin'
      return
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Successfully joined the group')
        // Refresh the groups list
        window.location.reload()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to join group')
      }
    } catch (error) {
      toast.error('Failed to join group')
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Successfully left the group')
        // Refresh the groups list
        window.location.reload()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to leave group')
      }
    } catch (error) {
      toast.error('Failed to leave group')
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Groups</h1>
            <p className="text-muted-foreground">Join existing groups or create your own community</p>
          </div>
          <Button onClick={() => window.location.href = '/groups/create'}>
            <Users className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search groups..." 
            className="pl-8 max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-6">
                  <div className="relative h-32 mb-4">
                    <Image
                      src={group.image || "/placeholder.svg"}
                      alt={group.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <Link href={`/groups/${group.id}`}>
                      <h3 className="text-xl font-semibold hover:text-primary">
                        {group.name}
                      </h3>
                    </Link>
                    {group.isPrivate && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={group.owner.image} />
                        <AvatarFallback>{group.owner.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Admin</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {group.memberCount}
                      </div>
                      {session && group.members.some(m => m.userId === session.user.id) ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLeaveGroup(group.id)}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Leave
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No groups found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

