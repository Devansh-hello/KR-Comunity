import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { moderateContent } from "@/lib/moderation"

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { content } = await req.json()
    const postId = params.postId

    // Moderate the content
    const moderationResult = await moderateContent({ content })
    if (!moderationResult.safe) {
      return NextResponse.json(
        { error: "Comment violates community guidelines" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
} 