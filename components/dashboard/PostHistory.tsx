"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

interface Post {
  id: string
  title: string
  createdAt: string
  likes: number
  comments: number
}

export function PostHistory() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/user/posts")
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error()
      setPosts(posts.filter(post => post.id !== postId))
      toast.success("Post deleted successfully")
    } catch (error) {
      toast.error("Failed to delete post")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posted on {format(new Date(post.createdAt), "PPP")}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/posts/${post.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 