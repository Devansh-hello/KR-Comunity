"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowUp, ArrowDown, MessageSquare, Edit, Trash2, AlertCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    image?: string
  }
}

interface Post {
  id: string
  title: string
  content: string
  image?: string
  createdAt: string
  author: {
    id: string
    name: string
    image?: string
  }
  community?: {
    name: string
  }
  _count: {
    votes: number
    comments: number
  }
  userVote?: number
  comments: Comment[]
}

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [params.postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.postId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/posts')
          return
        }
        throw new Error('Failed to load post')
      }
      const data = await response.json()
      setPost(data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load post")
      setLoading(false)
    }
  }

  const handleVote = async (value: number) => {
    if (!session) {
      router.push('/signin')
      return
    }

    try {
      const response = await fetch(`/api/posts/${params.postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      if (response.ok) {
        fetchPost()
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/signin')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${params.postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        setComment("")
        fetchPost()
      }
    } catch (error) {
      console.error("Error commenting:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!session) return
    
    setDeletingPost(true)
    try {
      const response = await fetch(`/api/posts/${params.postId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success("Post deleted successfully")
        router.push('/posts')
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    } finally {
      setDeletingPost(false)
      setDeleteDialogOpen(false)
    }
  }

  // Check if current user is author or admin
  const isAuthor = session?.user?.id === post?.author.id
  const isAdmin = session?.user?.role === 'ADMIN'
  const canEditDelete = isAuthor || isAdmin

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!post) return <div>Post not found</div>

  return (
    <div className="container py-8">
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(1)}
              className={post.userVote === 1 ? "text-primary" : ""}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">
              {post._count.votes}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(-1)}
              className={post.userVote === -1 ? "text-destructive" : ""}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {post.community && (
                  <>
                    <span className="font-medium text-primary">
                      c/{post.community.name}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>Posted by {post.author.name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>
              
              {canEditDelete && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/posts/edit/${post.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <p className="whitespace-pre-wrap">{post.content}</p>
            
            {post.image && (
              <img 
                src={post.image} 
                alt={post.title}
                className="mt-4 rounded-lg max-h-[500px] object-contain"
              />
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          
          {session && (
            <form onSubmit={handleComment} className="mb-6">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="mb-2"
                required
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{comment.author.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                  </div>
                  <p>{comment.content}</p>
                </Card>
              ))
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deletingPost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingPost ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 