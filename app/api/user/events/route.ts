import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: { 
        authorId: session.user.id 
      },
      select: {
        id: true,
        title: true,
        capacity: true,
        registered: true,
        deadline: true,
        registrations: {
          where: {
            checkedIn: true
          },
          select: {
            id: true
          }
        }
      },
      orderBy: { 
        createdAt: "desc"
      }
    })

    return NextResponse.json(
      events.map(event => ({
        ...event,
        checkedIn: event.registrations.length,
        registrations: undefined
      }))
    )
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
} 