"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Post {
  id: string
  title: string
  content: string
  upvotes: number
  comments: number
  author: {
    name: string
    image?: string
  }
}

export function TopPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts/top')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/posts/${post.id}`} className="block">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.image} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ArrowUp className="h-4 w-4" />
                            {post.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 