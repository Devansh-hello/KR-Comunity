"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateEventPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    capacity: 0,
    deadline: new Date().toISOString().slice(0, 16), // Set default to current date-time
    location: "",
    image: "",
  })

  if (status === "loading") {
    return <div className="container py-8">Loading...</div>
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/events")
      } else {
        setError(data.error || "Failed to create event")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="CULTURAL">Cultural</SelectItem>
                  <SelectItem value="SPORTS">Sports</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Registration Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Event Image</Label>
              <ImageUpload
                onImageSelect={(file) => {
                  // Handle image upload and get URL
                  setFormData({ ...formData, image: "URL_FROM_UPLOAD" })
                }}
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 