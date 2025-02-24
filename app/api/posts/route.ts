import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { moderateContent } from "@/lib/moderation"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get("sort") || "latest"
  const session = await getServerSession(authOptions)

  try {
    const posts = await prisma.post.findMany({
      where: {
        moderated: true,
        reported: false,
      },
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
      orderBy: sort === "top" 
        ? {
            votes: {
              _count: "desc",
            },
          }
        : {
            createdAt: "desc",
          },
    })

    // Transform the posts to include userVote
    const transformedPosts = posts.map(post => ({
      ...post,
      userVote: post.votes?.[0]?.value || 0,
      votes: undefined, // Remove the votes array from the response
    }))

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { title, content, image, communityId } = await req.json()

    // Moderate the content
    const moderationResult = await moderateContent({ title, content })
    if (!moderationResult.safe) {
      return NextResponse.json(
        { error: "Content violates community guidelines" },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image,
        communityId,
        authorId: session.user.id,
        moderated: true, // Content has been checked
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

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
} 