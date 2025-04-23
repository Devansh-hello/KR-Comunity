import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Create a test post
    const newPost = await prisma.post.create({
      data: {
        title: "Hello KR Community!",
        content: "This is a test post to verify that the posts system is working correctly. Feel free to upvote or comment!",
        upvotes: 0,
        moderated: true,
        author: {
          connect: { id: user.id }
        }
      }
    })
    
    console.log("Created seed post successfully:", newPost.id)
    
    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title
      }
    })
  } catch (error) {
    console.error("Error creating seed post:", error)
    return NextResponse.json(
      { error: "Failed to create seed post" },
      { status: 500 }
    )
  }
} 