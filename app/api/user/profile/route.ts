import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { username, name, bio, image } = await req.json()

    // Check if username is already taken
    if (username !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username, name, bio, image }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
} 