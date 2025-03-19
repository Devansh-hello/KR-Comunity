import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const eventId = params.eventId
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { message: "You must be logged in to view registrations" },
      { status: 401 }
    )
  }
  
  try {
    // Verify the user is the event organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        authorId: true
      }
    })
    
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }
    
    // Check if user is the event organizer
    if (event.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only view registrations for events you've created" },
        { status: 403 }
      )
    }
    
    // Fetch all registrations with user details
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: [
        { checkedIn: 'desc' },
        { createdAt: 'asc' }
      ]
    })
    
    return NextResponse.json(registrations)
    
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching registrations" },
      { status: 500 }
    )
  }
} 