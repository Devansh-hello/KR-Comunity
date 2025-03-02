import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, content, category, capacity, deadline, location, image } = await req.json()

    const event = await prisma.event.create({
      data: {
        title,
        content,
        category,
        capacity: parseInt(capacity),
        deadline: new Date(deadline),
        location,
        image,
        authorId: session.user.id,
        registered: 0, // Start with 0 registrations
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