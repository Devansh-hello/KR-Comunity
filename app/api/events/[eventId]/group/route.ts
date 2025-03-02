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
    const { name, description } = await req.json()

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: { group: true }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.group) {
      return NextResponse.json({ error: "Group already exists" }, { status: 400 })
    }

    const group = await prisma.eventGroup.create({
      data: {
        name,
        description,
        eventId: params.eventId,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN"
          }
        }
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
} 