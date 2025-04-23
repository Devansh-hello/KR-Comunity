import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Get a single post
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
            id: true,
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

// Update a post
export async function PUT(
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
    const postId = params.postId
    const { title, content, image } = await req.json()
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Check if user is author or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    const isAdmin = user?.role === "ADMIN"
    const isAuthor = post.authorId === user?.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "You don't have permission to edit this post" },
        { status: 403 }
      )
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content: content || "",
        image,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

// Delete a post
export async function DELETE(
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
    const postId = params.postId

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Check if user is author or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    const isAdmin = user?.role === "ADMIN"
    const isAuthor = post.authorId === user?.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "You don't have permission to delete this post" },
        { status: 403 }
      )
    }

    // Delete the post (this will cascade delete votes and comments)
    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
} 