import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to register for an event" },
        { status: 401 }
      )
    }
    
    // Get user ID from session
    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in session" },
        { status: 400 }
      )
    }
    
    // Parse request body
    const data = await req.json()
    const { name, email, rollNo } = data
    
    // Validate event ID
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      )
    }
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })
    
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }
    
    // Check if event has reached capacity
    if (event.capacity && event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { message: "Event has reached maximum capacity" },
        { status: 400 }
      )
    }
    
    // Check if user is already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId: eventId,
        userId: userId
      }
    })
    
    if (existingRegistration) {
      return NextResponse.json(
        { message: "You have already registered for this event" },
        { status: 400 }
      )
    }
    
    // Create registration
    const registration = await prisma.registration.create({
      data: {
        eventId: eventId,
        userId: userId,
        fullName: name,
        rollNo: rollNo || '',
        checkedIn: false
      }
    })
    
    return NextResponse.json(
      { 
        message: "Registration successful",
        registration: {
          id: registration.id,
          createdAt: registration.createdAt
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error("Error in event registration:", error)
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    )
  }
}

// Check registration status
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { registered: false, message: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Get user ID from session
    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { registered: false, message: "User ID not found" },
        { status: 400 }
      )
    }
    
    // Check if user is already registered
    const registration = await prisma.registration.findFirst({
      where: {
        eventId: eventId,
        userId: userId
      }
    })
    
    return NextResponse.json({
      registered: !!registration,
      registration: registration ? {
        id: registration.id,
        fullName: registration.fullName,
        rollNo: registration.rollNo,
        checkedIn: registration.checkedIn,
        createdAt: registration.createdAt
      } : null
    })
    
  } catch (error) {
    console.error("Error checking registration:", error)
    return NextResponse.json(
      { registered: false, message: "An error occurred" },
      { status: 500 }
    )
  }
} 