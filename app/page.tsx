"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Calendar, Heart, MessageCircle, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react"

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
  _count: {
    votes: number
    comments: number
  }
  userVote?: number
}

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  const fetchLatestPosts = async () => {
    try {
      const response = await fetch('/api/posts?sort=latest')
      const data = await response.json()
      setPosts(data.slice(0, 6)) // Show only the 6 most recent posts
      setLoading(false)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!session) {
      // Redirect to sign in if not authenticated
      window.location.href = '/signin'
      return
    }
    // Implement like functionality
    console.log('Liking post:', postId)
  }

  const handleShare = async (postId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          url: `${window.location.origin}/post/${postId}`,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Latest Event */}
      <section className="py-12 border-b bg-muted/50">
        <div className="container">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600">
                    Alert!!!
                  </div>
                  <h1 className="text-3xl font-bold">Join the Hackathon</h1>
                  <p className="text-muted-foreground">
                    Don't miss out on our upcoming community hackathon! Join teams, build projects, and win amazing
                    prizes.
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/events/hackathon">Register Now</Link>
                  </Button>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt="Hackathon banner"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold gradient-text">Latest Posts</h2>
              <Button
                onClick={() => router.push('/posts')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                View All Posts
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author.image} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">{post.author.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <Link href={`/posts/${post.id}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-accent transition-colors line-clamp-2">
                          {post.title}
                        </h3>
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

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{post._count.votes}</span>
                          <ArrowUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">{post._count.comments}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="relative h-48 -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-lg">
                  <Image src="/placeholder.svg?height=200&width=400" alt="Events" fill className="object-cover" />
                </div>
                <Calendar className="h-8 w-8 mb-2" />
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse and join upcoming community events, meetups, and workshops.
                </p>
                <Button variant="link" className="mt-2 p-0">
                  View Events →
                </Button>
              </CardContent>
            </Card>

            {/* Similar cards for Groups and Lost & Found... */}
          </div>
        </div>
      </section>
    </div>
  )
}

