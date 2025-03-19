import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// Extended User type to include id
interface ExtendedUser {
  name?: string | null;
  email?: string | null; 
  image?: string | null;
  id: string;
}

// Extended Session type
interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions) as ExtendedSession | null
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const eventId = params.eventId
  const { title, content, category, capacity, deadline, location, image } = await req.json()

  try {
    // Check if event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (event.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this event" },
        { status: 403 }
      )
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        content,
        category,
        capacity: typeof capacity === 'number' ? capacity : parseInt(capacity),
        deadline: new Date(deadline),
        location,
        image,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions) as ExtendedSession | null
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const eventId = params.eventId

  try {
    // Check if event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (event.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this event" },
        { status: 403 }
      )
    }

    // Delete event
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
} 