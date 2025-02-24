import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import Image from "next/image"

export default function PostPage({ params }: { params: { id: string } }) {
  // In a real application, you would fetch the post data based on the ID
  const post = {
    id: params.id,
    title: "My Amazing Setup",
    content: "Just finished setting up my new development environment. Check out this amazing setup! #coding #setup",
    author: {
      name: "John Doe",
      avatar: "/placeholder.svg",
    },
    createdAt: "2 hours ago",
    image: "/placeholder.svg?height=400&width=800",
    likes: 245,
    comments: 45,
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-sm text-muted-foreground">
                Posted by {post.author.name} • {post.createdAt}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
            <Image src={post.image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
          </div>
          <p className="mb-4">{post.content}</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Button variant="ghost" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments section could be added here */}
    </div>
  )
}

