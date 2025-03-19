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

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession() as ExtendedSession
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to check registration status" },
        { status: 401 }
      )
    }

    // Check if the user is already registered for this event
    const registration = await prisma.registration.findFirst({
      where: {
        AND: [
          { eventId: params.eventId },
          { userId: session.user.id }
        ]
      }
    })

    return NextResponse.json({
      registered: !!registration,
      registration: registration || null,
    })
  } catch (error) {
    console.error("Check registration error:", error)
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    )
  }
} 