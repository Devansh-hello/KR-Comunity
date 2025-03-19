import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
}

interface ExtendedSession {
  user?: ExtendedUser
}

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession() as ExtendedSession
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to manage check-ins" },
        { status: 401 }
      )
    }

    const { registrationId, checkIn } = await req.json()
    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      )
    }

    // Verify the event exists and the user is the author
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { authorId: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (event.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to manage check-ins for this event" },
        { status: 403 }
      )
    }

    // Update the registration check-in status
    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkedIn: checkIn,
        checkedInAt: checkIn ? new Date() : null
      }
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json(
      { error: "Failed to update check-in status" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession() as ExtendedSession | null

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view check-ins" },
        { status: 401 }
      )
    }

    const eventId = params.eventId

    // Get the event and verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        authorId: true
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Verify that the user is the event author
    if (event.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to view check-ins for this event" },
        { status: 403 }
      )
    }

    // Get all registrations for the event
    const registrations = await prisma.registration.findMany({
      where: {
        eventId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    )
  }
} 