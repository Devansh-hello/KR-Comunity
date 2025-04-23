import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { moderateContent } from "@/lib/moderation"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get("sort") || "latest"
  const session = await getServerSession(authOptions)

  console.log(`Fetching posts with sort=${sort} and session=${!!session}`)

  try {
    // Read the Post schema - it has an "upvotes" field directly and a relation to comments
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
            comments: true,
            votes: true,
          },
        },
        votes: session ? {
          where: {
            userId: session.user.id,
          },
        } : undefined,
      },
      orderBy: sort === "top" 
        ? {
            upvotes: "desc",
          }
        : sort === "following" 
        ? {
            createdAt: "desc" // For following, will need more complex logic later
          }
        : {
            createdAt: "desc", // Default is latest
          },
      take: 20, // Limit number of posts returned
    })

    console.log(`Found ${posts.length} posts in database`)
    
    if (posts.length === 0) {
      console.log("No posts found. Creating a sample post for testing...")
      // If no posts exist, create a test post for debugging
      if (session) {
        try {
          await prisma.post.create({
            data: {
              title: "Test Post",
              content: "This is a test post created automatically because no posts were found.",
              moderated: true,
              upvotes: 5,
              author: {
                connect: { id: session.user.id }
              }
            }
          })
          console.log("Created test post successfully")
        } catch (error) {
          console.error("Error creating test post:", error)
        }
      }
    }

    // Transform the posts to include userVote
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      author: post.author,
      community: post.community,
      userVote: post.votes?.[0]?.value || 0,
      _count: {
        votes: post._count.votes,
        comments: post._count.comments,
      }
    }))

    console.log(`Returning ${transformedPosts.length} transformed posts`)
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
    
    // Validate required fields
    if (!body.title || body.title.trim() === '') {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
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
    
    // Create the post with author connected, content is now optional
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content || "", // Default to empty string if content is not provided
        image: body.image,
        moderated: true, // Auto-approve for now
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