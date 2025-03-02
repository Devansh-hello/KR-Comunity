"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  image?: string
}

export function Communities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const response = await fetch('/api/communities')
        if (!response.ok) throw new Error("Failed to fetch communities")
        const data = await response.json()
        setCommunities(data)
      } catch (error) {
        console.error("Error fetching communities:", error)
        setError("Failed to load communities")
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Communities</h2>
          <Button asChild variant="outline">
            <Link href="/communities">View All</Link>
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
          <Link href="/communities">View All</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {communities && communities.length > 0 ? (
          communities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/communities/${community.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={community.image} />
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{community.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <Users className="h-4 w-4 inline mr-1" />
                          {community.memberCount} members
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {community.description}
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