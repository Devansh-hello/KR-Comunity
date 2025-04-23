import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching top posts")
    const posts = await prisma.post.findMany({
      where: {
        moderated: true,
        reported: false,
      },
      take: 5,
      orderBy: {
        upvotes: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        upvotes: true,
        author: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            comments: true,
          }
        }
      }
    })

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      upvotes: post.upvotes,
      comments: post._count.comments,
      author: post.author
    }))

    console.log(`Returning ${formattedPosts.length} top posts`)
    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("Failed to fetch top posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch top posts" },
      { status: 500 }
    )
  }
} 