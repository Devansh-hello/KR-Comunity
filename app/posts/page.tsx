"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowUp, ArrowDown, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Post {
  id: string
  title: string
  content: string
  image?: string
  createdAt: string
  author: {
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
}

export default function PostsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("latest")
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    fetchPosts(activeTab)
  }, [activeTab])

  const fetchPosts = async (sort: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log(`Fetching posts with sort=${sort}`)
      
      const response = await fetch(`/api/posts?sort=${sort}`)
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`)
        setError(`Failed to load posts. Server returned ${response.status}`)
        setLoading(false)
        return
      }
      
      const data = await response.json()
      console.log(`Received ${data.length} posts from API:`, data)
      
      setPosts(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Failed to load posts. Please try again later.")
      setLoading(false)
    }
  }

  const handleVote = async (postId: string, value: number) => {
    if (!session) {
      router.push('/signin')
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      if (response.ok) {
        fetchPosts(activeTab)
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const seedTestPost = async () => {
    try {
      setLoading(true)
      console.log("Creating a test post...")
      
      const response = await fetch('/api/posts/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("Test post created:", result)
        fetchPosts(activeTab)
      } else {
        const error = await response.json()
        console.error("Failed to create test post:", error)
        setError(`Failed to create test post: ${error.error || response.statusText}`)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error creating test post:", error)
      setError("Failed to create test post. Please try again.")
      setLoading(false)
    }
  }

  // Function to render post cards - used by all tabs
  const renderPosts = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => fetchPosts(activeTab)} className="mt-4">
            Try Again
          </Button>
        </Card>
      )
    }

    if (posts.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No posts found in this category.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button asChild variant="outline">
              <Link href="/posts/new">Create a Post</Link>
            </Button>
            {session && (
              <Button variant="secondary" onClick={seedTestPost}>
                Create Test Post
              </Button>
            )}
          </div>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/posts/${post.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleVote(post.id, 1)
                        }}
                        className={cn(
                          "hover:bg-primary/10 transition-colors",
                          post.userVote === 1 && "text-primary"
                        )}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2ch] text-center">
                        {post._count.votes}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleVote(post.id, -1)
                        }}
                        className={cn(
                          "hover:bg-destructive/10 transition-colors",
                          post.userVote === -1 && "text-destructive"
                        )}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.image} />
                          <AvatarFallback>{post.author.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{post.author.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                      </div>

                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      {post.image && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <p className="text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post._count.comments}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto hover:bg-primary/10"
                          onClick={(e) => {
                            e.preventDefault()
                            // Share functionality
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          Posts
        </h1>
        <Button asChild>
          <Link href="/posts/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Post
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mb-8">
          <TabsTrigger value="latest" className="flex-1">Latest</TabsTrigger>
          <TabsTrigger value="top" className="flex-1">Top</TabsTrigger>
          <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="latest" className="space-y-4">
          {renderPosts()}
        </TabsContent>
        
        <TabsContent value="top" className="space-y-4">
          {renderPosts()}
        </TabsContent>
        
        <TabsContent value="following" className="space-y-4">
          {renderPosts()}
        </TabsContent>
      </Tabs>
    </div>
  )
} 