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
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { TopPosts } from "@/components/home/TopPosts"
import { LatestPosts } from "@/components/home/LatestPosts"
import { Communities } from "@/components/home/Communities"
import { UpcomingEvents } from "@/components/home/UpcomingEvents"
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
  _count: {
    votes: number
    comments: number
  }
  userVote?: number
}

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
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
    <div className="min-h-screen space-y-16 py-12">
      {/* Hero Carousel */}
      <section className="container">
        <HeroCarousel />
      </section>

      {/* Posts Grid */}
      <section className="container">
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <TopPosts />
          <LatestPosts />
        </motion.div>
      </section>

      {/* Communities */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Communities />
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container pb-16">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <UpcomingEvents />
        </motion.div>
      </section>
    </div>
  )
}

