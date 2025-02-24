"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowUp, ArrowDown, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    fetchPosts(activeTab)
  }, [activeTab])

  const fetchPosts = async (sort: string) => {
    try {
      const response = await fetch(`/api/posts?sort=${sort}`)
      const data = await response.json()
      setPosts(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching posts:", error)
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

  return (
    <div className="container px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Posts</h1>
        <Button
          onClick={() => router.push('/posts/create')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      <Tabs defaultValue="latest" className="mb-6 sm:mb-8">
        <TabsList className="w-full sm:w-[200px] grid grid-cols-2">
          <TabsTrigger 
            value="latest" 
            onClick={() => setActiveTab("latest")}
            className="text-sm sm:text-base"
          >
            Latest
          </TabsTrigger>
          <TabsTrigger 
            value="top" 
            onClick={() => setActiveTab("top")}
            className="text-sm sm:text-base"
          >
            Top
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={post.author.image} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      {post.author.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <Link href={`/posts/${post.id}`}>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                </Link>

                {post.image && (
                  <div className="relative aspect-[16/9] mb-4 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}

                <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center justify-between sm:justify-start sm:space-x-6 text-muted-foreground">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="ghost"
                      size={isMobile ? "icon" : "sm"}
                      onClick={() => handleVote(post.id, 1)}
                      className={`p-1 sm:p-2 ${post.userVote === 1 ? "text-accent" : ""}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm sm:text-base min-w-[2ch] text-center">
                      {post._count.votes}
                    </span>
                    <Button
                      variant="ghost"
                      size={isMobile ? "icon" : "sm"}
                      onClick={() => handleVote(post.id, -1)}
                      className={`p-1 sm:p-2 ${post.userVote === -1 ? "text-destructive" : ""}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "icon" : "sm"}
                    className="p-1 sm:p-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">
                      {post._count.comments}
                    </span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "icon" : "sm"}
                    className="p-1 sm:p-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 