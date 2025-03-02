import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { authorId: true }
    })

    if (!event || event.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendees = await prisma.registration.findMany({
      where: { eventId: params.eventId },
      include: {
        user: {
          select: {
            username: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(attendees)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    )
  }
} 