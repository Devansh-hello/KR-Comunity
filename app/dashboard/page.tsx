"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventHistory } from "@/components/dashboard/EventHistory"
import { MyEvents } from "@/components/dashboard/MyEvents"

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Manage your account and view your activity
      </p>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="myEvents">My Events</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            {/* Profile content will go here */}
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <EventHistory />
          </Card>
        </TabsContent>

        <TabsContent value="myEvents">
          <Card>
            <MyEvents />
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            {/* Posts content will go here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 