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
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(posts.map(post => ({
      ...post,
      likes: post._count.likes,
      comments: post._count.comments
    })))
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
} 