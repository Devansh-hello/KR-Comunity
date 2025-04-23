"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Crown, ShieldCheck } from "lucide-react"

interface Member {
  userId: string
  role: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface GroupMembersProps {
  groupId: string
  isAdmin: boolean
  isOwner: boolean
}

export default function GroupMembers({ groupId, isAdmin, isOwner }: GroupMembersProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // We'll reuse the group API endpoint since it already includes members
        const response = await fetch(`/api/groups/${groupId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch members")
        }
        
        const data = await response.json()
        setMembers(data.members)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching members:", err)
        setError("Failed to load members")
        setLoading(false)
      }
    }
    
    fetchMembers()
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 flex gap-1 items-center"><Crown className="h-3 w-3" /> Owner</Badge>
      case "ADMIN":
        return <Badge className="bg-blue-500 hover:bg-blue-600 flex gap-1 items-center"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
      default:
        return <Badge variant="outline">Member</Badge>
    }
  }

  return (
    <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.userId} className="bg-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  {member.user.image ? (
                    <AvatarImage src={member.user.image} alt={member.user.name || "Member"} />
                  ) : (
                    <AvatarFallback>
                      {member.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{member.user.name || "Unnamed User"}</p>
                  <div className="mt-1">
                    {getRoleBadge(member.role)}
                  </div>
                </div>
              </div>
              
              {isAdmin && member.role !== "OWNER" && member.userId !== isOwner && (
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 