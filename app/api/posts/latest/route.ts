import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching latest posts")
    const posts = await prisma.post.findMany({
      where: {
        moderated: true,
        reported: false,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
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
      createdAt: post.createdAt,
      upvotes: post.upvotes,
      comments: post._count.comments,
      author: post.author
    }))

    console.log(`Returning ${formattedPosts.length} latest posts`)
    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("Failed to fetch latest posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch latest posts" },
      { status: 500 }
    )
  }
} 