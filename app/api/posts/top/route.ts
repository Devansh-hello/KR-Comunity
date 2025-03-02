import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: {
        upvotes: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        upvotes: true,
        comments: {
          select: {
            id: true,
          }
        },
        author: {
          select: {
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(
      posts.map(post => ({
        ...post,
        comments: post.comments.length,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch top posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch top posts" },
      { status: 500 }
    )
  }
} 