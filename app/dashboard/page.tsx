"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventHistory } from "@/components/dashboard/EventHistory"
import { MyEvents } from "@/components/dashboard/MyEvents"
import { PostHistory } from "@/components/dashboard/PostHistory"
import { ProfileSettings } from "@/components/dashboard/ProfileSettings"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "@/components/providers/client-search-params"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EventRegistrations } from "@/components/dashboard/EventRegistrations"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "profile")

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="container py-16 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/sign-in?callbackUrl=/dashboard")
    return null
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard?tab=${value}`, { scroll: false })
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="myEvents">My Events</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="posts">
          <Card>
            <CardContent className="p-6">
              <PostHistory />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardContent className="p-6">
              <EventHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="myEvents">
          <Card>
            <CardContent className="p-6">
              <MyEvents />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardContent className="p-6">
              <EventRegistrations />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 