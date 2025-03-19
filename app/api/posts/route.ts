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
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    // Find the user ID from the session email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }
    
    // Create the post with author connected
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        image: body.image,
        author: {
          connect: { id: user.id }
        }
        // Add communityId if needed
      },
    });
    
    return new Response(JSON.stringify(post), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(JSON.stringify({ error: "Failed to create post" }), {
      status: 500,
    });
  }
} 