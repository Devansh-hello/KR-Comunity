import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { name, description, isPrivate, image } = await req.json()

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      )
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: "Group description is required" },
        { status: 400 }
      )
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        name,
        description,
        isPrivate: isPrivate || false,
        image,
        owner: {
          connect: { id: session.user.id }
        },
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN"
          }
        }
      }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    )
  }
}

// Get all groups (optional, can be implemented later)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    // Get all public groups and groups the user is a member of
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { isPrivate: false },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        _count: {
          select: { members: true }
        },
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        members: {
          select: {
            userId: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    )
  }
} 