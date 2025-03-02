"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStats } from "@/components/admin/UserStats"
import { ContentModeration } from "@/components/admin/ContentModeration"
import { EventManagement } from "@/components/admin/EventManagement"
import { UserManagement } from "@/components/admin/UserManagement"
import { redirect } from "next/navigation"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("stats")

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, content, and view platform statistics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <UserStats />
          </TabsContent>
          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>
          <TabsContent value="events">
            <EventManagement />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 