import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { userId, permissions } = await req.json()
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { permissions }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update permissions" },
      { status: 500 }
    )
  }
} 