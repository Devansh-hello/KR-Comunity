import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions)
  const postId = params.postId

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
        votes: session ? {
          where: {
            userId: session.user.id,
          },
        } : false,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Transform the post to include userVote
    const transformedPost = {
      ...post,
      userVote: post.votes?.[0]?.value || 0,
      votes: undefined, // Remove the votes array from the response
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
} 