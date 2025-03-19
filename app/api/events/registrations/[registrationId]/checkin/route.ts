import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { registrationId: string } }
) {
  const registrationId = params.registrationId
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { message: "You must be logged in to update check-in status" },
      { status: 401 }
    )
  }
  
  try {
    // Parse request body
    const { checkedIn } = await req.json()
    
    // Fetch the registration to get the event ID
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        eventId: true,
        event: {
          select: {
            authorId: true
          }
        }
      }
    })
    
    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      )
    }
    
    // Verify the user is the event organizer
    if (registration.event.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only manage check-ins for events you've created" },
        { status: 403 }
      )
    }
    
    // Update check-in status
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkedIn: checkedIn,
        checkedInAt: checkedIn ? new Date() : null
      }
    })
    
    return NextResponse.json(updatedRegistration)
    
  } catch (error) {
    console.error("Error updating check-in status:", error)
    return NextResponse.json(
      { message: "An error occurred while updating check-in status" },
      { status: 500 }
    )
  }
} 