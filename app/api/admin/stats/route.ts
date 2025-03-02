import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { subMonths } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const lastMonth = subMonths(new Date(), 1)

    const [
      totalUsers,
      activeUsers,
      totalEvents,
      totalPosts,
      lastMonthUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [
            { posts: { some: { createdAt: { gte: lastMonth } } } },
            { events: { some: { createdAt: { gte: lastMonth } } } },
            { registrations: { some: { createdAt: { gte: lastMonth } } } }
          ]
        }
      }),
      prisma.event.count(),
      prisma.post.count(),
      prisma.user.count({
        where: { createdAt: { lt: lastMonth } }
      })
    ])

    const userGrowth = lastMonthUsers 
      ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : 0

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalEvents,
      totalPosts,
      userGrowth: Math.round(userGrowth * 10) / 10
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
} 