import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") || "all"

  try {
    const posts = await prisma.post.findMany({
      where: filter === "reported" ? { reported: true } : {},
      select: {
        id: true,
        title: true,
        createdAt: true,
        reported: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: filter === "recent" ? 50 : undefined
    })

    const events = await prisma.event.findMany({
      where: filter === "reported" ? { reported: true } : {},
      select: {
        id: true,
        title: true,
        createdAt: true,
        reported: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: filter === "recent" ? 50 : undefined
    })

    const content = [
      ...posts.map(p => ({ ...p, type: "post" as const })),
      ...events.map(e => ({ ...e, type: "event" as const }))
    ].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
} 