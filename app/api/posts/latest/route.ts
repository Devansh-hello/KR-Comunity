import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch latest posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch latest posts" },
      { status: 500 }
    )
  }
} 