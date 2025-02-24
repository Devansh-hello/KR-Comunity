import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

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
    const { value } = await req.json()
    const postId = params.postId

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote if clicking the same button
        await prisma.vote.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            },
          },
        })
      } else {
        // Update vote if changing from upvote to downvote or vice versa
        await prisma.vote.update({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            },
          },
          data: { value },
        })
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          value,
          userId: session.user.id,
          postId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    )
  }
} 