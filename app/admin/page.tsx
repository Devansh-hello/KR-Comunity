"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UserStats } from "@/components/admin/UserStats"
import { ContentModeration } from "@/components/admin/ContentModeration"
import { EventManagement } from "@/components/admin/EventManagement"
import { UserManagement } from "@/components/admin/UserManagement"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Extended User type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null; 
  image?: string | null;
  role?: string;
  id?: string;
}

// Extended Session type
interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string }
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState("stats")

  useEffect(() => {
    // If authentication status is known and user is not an admin, redirect to home
    if (status !== "loading" && (!session?.user || session.user.role !== "ADMIN")) {
      router.push("/")
    }

    // Set active tab based on URL parameter
    if (tabParam && ["stats", "users", "content", "events"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [status, session, router, tabParam])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="container py-16 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // If not admin, don't render anything (will be redirected)
  if (!session?.user || session.user.role !== "ADMIN") {
    return null
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update URL to reflect the active tab
    router.push(`/admin?tab=${value}`, { scroll: false })
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

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="mt-6">
            <Card className="p-6">
              <UserStats />
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="mt-6">
            <Card className="p-6">
              <ContentModeration />
            </Card>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <Card className="p-6">
              <EventManagement />
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <Card className="p-6">
              <UserManagement />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 