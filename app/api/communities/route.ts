import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      take: 6,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        members: {
          select: {
            userId: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      communities.map(community => ({
        id: community.id,
        name: community.name,
        description: community.description,
        image: community.image,
        memberCount: community.members.length
      }))
    )
  } catch (error) {
    console.error("Failed to fetch communities:", error)
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    )
  }
} 