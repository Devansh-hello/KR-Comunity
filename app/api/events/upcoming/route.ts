import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const now = new Date()
    const events = await prisma.event.findMany({
      where: {
        deadline: {
          gt: now
        }
      },
      take: 6,
      orderBy: {
        deadline: 'asc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        location: true,
        deadline: true,
        capacity: true,
        registered: true,
        image: true,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch upcoming events:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming events" },
      { status: 500 }
    )
  }
} 