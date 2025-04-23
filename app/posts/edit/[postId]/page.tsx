"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ImageUpload"
import { Loader2 } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  image?: string
  author: {
    id: string
    name: string
    image?: string
  }
}

export default function EditPostPage({ params }: { params: { postId: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Post | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/posts/${params.postId}`)
        
        if (response.status === 404) {
          router.push("/posts")
          return
        }
        
        const data = await response.json()
        
        if (response.ok) {
          // Check if user is author or admin
          const isAdmin = session?.user?.role === "ADMIN"
          const isAuthor = session?.user?.id === data.author.id
          
          if (!isAdmin && !isAuthor) {
            setUnauthorized(true)
            return
          }
          
          setFormData(data)
        } else {
          setError(data.error || "Failed to fetch post")
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchPost()
    }
  }, [params.postId, router, session, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/posts/${params.postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          image: formData.image,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/posts/${params.postId}`)
      } else {
        setError(data.error || "Failed to update post")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
              <p>You do not have permission to edit this post.</p>
              <Button onClick={() => router.push(`/posts/${params.postId}`)}>
                Back to Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Post Not Found</h2>
              <Button onClick={() => router.push("/posts")}>
                Back to Posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Optional)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px] resize-none"
                placeholder="Share your thoughts..."
              />
            </div>

            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <ImageUpload
                value={formData.image || ""}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/posts/${params.postId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 