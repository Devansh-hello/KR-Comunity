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
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        deadline: true,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch latest events:", error)
    return NextResponse.json(
      { error: "Failed to fetch latest events" },
      { status: 500 }
    )
  }
} 