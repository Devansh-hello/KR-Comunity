import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const count = await prisma.registration.count({
      where: {
        eventId: params.eventId,
        checkedIn: true,
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching check-in count:", error)
    return NextResponse.json(
      { error: "Failed to fetch check-in count" },
      { status: 500 }
    )
  }
} 