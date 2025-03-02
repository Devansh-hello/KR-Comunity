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
    const { registrationId } = await req.json()
    
    const registration = await prisma.registration.update({
      where: {
        id: registrationId,
        eventId: params.eventId,
      },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      }
    })

    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 })
  }
} 