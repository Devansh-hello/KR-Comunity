import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { Event } from "@prisma/client"
import { authOptions } from "@/lib/auth"

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ExtendedSession {
  user?: ExtendedUser
  expires: string
}

type EventWithCount = Partial<Event> & {
  _count: {
    registrations: number
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { message: "You must be logged in to view your events" },
      { status: 401 }
    )
  }
  
  try {
    // Fetch events created by the user
    const events = await prisma.event.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        capacity: true,
        deadline: true,
        location: true,
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(events)
    
  } catch (error) {
    console.error("Error fetching user events:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching your events" },
      { status: 500 }
    )
  }
} 