import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const registrations = await prisma.registration.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            deadline: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Failed to fetch registrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
} 