import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        deadline: 'asc',
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "You must be signed in to create events" }, { status: 401 })
    }
    
    if (!session.user.id) {
      console.error("User session found but no user ID available:", session)
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 })
    }

    const userData = await req.json()
    const { title, content, category, capacity, deadline, location, image } = userData
    
    if (!title || !content || !category || !capacity || !deadline || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    console.log("Creating event with data:", {
      title,
      category,
      authorId: session.user.id,
      image: image ? "[image data available]" : "no image"
    })
    
    // First check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })
    
    if (!user) {
      console.error("User not found in database:", session.user.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        content,
        category,
        capacity: parseInt(String(capacity)),
        deadline: new Date(deadline),
        location,
        image,
        authorId: session.user.id,
        registered: 0
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json(
      { error: "Failed to create event" }, 
      { status: 500 }
    )
  }
} 