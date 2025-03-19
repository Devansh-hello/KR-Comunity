import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(posts.map(post => ({
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      likes: post._count?.votes || 0,
      comments: post._count?.comments || 0
    })))
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
} 