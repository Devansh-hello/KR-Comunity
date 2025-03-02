"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, MessageSquare, TrendingUp } from "lucide-react"

interface Stats {
  totalUsers: number
  activeUsers: number
  totalEvents: number
  totalPosts: number
  userGrowth: number
}

export function UserStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      setStats(data)
    }
    fetchStats()
  }, [])

  if (!stats) return <div>Loading...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.userGrowth}% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
          </p>
        </CardContent>
      </Card>
      
      {/* Similar cards for events and posts */}
    </div>
  )
} 