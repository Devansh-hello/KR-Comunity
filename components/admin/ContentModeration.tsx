"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Content {
  id: string
  type: "post" | "event" | "group"
  title: string
  author: {
    name: string
    email: string
  }
  createdAt: string
  reported: boolean
}

export function ContentModeration() {
  const [content, setContent] = useState<Content[]>([])
  const [activeTab, setActiveTab] = useState("reported")

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    const response = await fetch(`/api/admin/content?filter=${activeTab}`)
    const data = await response.json()
    setContent(data)
  }

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error()
      setContent(content.filter(item => item.id !== id))
      toast.success("Content deleted successfully")
    } catch (error) {
      toast.error("Failed to delete content")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="reported">Reported</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {content.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {item.author.name} ({item.author.email})
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDelete(item.id, item.type)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 