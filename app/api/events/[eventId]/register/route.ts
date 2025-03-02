import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { fullName, rollNo } = await req.json()
    const event = await prisma.event.findUnique({
      where: { id: params.eventId }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check registration deadline
    if (new Date() > new Date(event.deadline)) {
      return NextResponse.json({ error: "Registration closed" }, { status: 400 })
    }

    // Check capacity
    if (event.registered >= event.capacity) {
      return NextResponse.json({ error: "Event full" }, { status: 400 })
    }

    // Create registration
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          fullName,
          rollNo,
          eventId: params.eventId,
          userId: session.user.id,
        }
      })

      await tx.event.update({
        where: { id: params.eventId },
        data: { registered: { increment: 1 } }
      })

      return reg
    })

    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
} 