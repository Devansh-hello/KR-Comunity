"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Group {
  id: string
  name: string
  description: string
  isPrivate: boolean
  image?: string
  _count: {
    members: number
  }
  members: {
    userId: string
    role: string
  }[]
}

export function Communities() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups')
        if (!response.ok) throw new Error("Failed to fetch groups")
        const data = await response.json()
        console.log("Fetched groups data:", data); // Debugging log
        setGroups(data)
      } catch (error) {
        console.error("Error fetching groups:", error)
        setError("Failed to load groups")
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Communities</h2>
          <Button asChild variant="outline">
            <Link href="/groups">View All</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Communities</h2>
        <Button asChild variant="outline">
          <Link href="/groups">View All</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups && groups.length > 0 ? (
          groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/groups/${group.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.image} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <Users className="h-4 w-4 inline mr-1" />
                          {group._count?.members || group.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No communities found</p>
          </div>
        )}
      </div>
    </div>
  )
} 