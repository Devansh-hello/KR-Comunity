import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Get all channels in a group
export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const groupId = params.groupId

    // Check if the user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      )
    }

    // Get all channels in the group
    const channels = await prisma.Channel.findMany({
      where: {
        groupId,
        isArchived: false
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    )
  }
}

// Create a new channel in a group
export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const groupId = params.groupId
    const { name, description, type } = await req.json()

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      )
    }

    // Check if user is a group admin or owner
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: { in: ["ADMIN", "OWNER"] }
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    const isOwner = group.ownerId === session.user.id
    const isAdmin = group.members.length > 0

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to create channels in this group" },
        { status: 403 }
      )
    }

    // Check if channel with the same name already exists
    const existingChannel = await prisma.Channel.findUnique({
      where: {
        groupId_name: {
          groupId,
          name
        }
      }
    })

    if (existingChannel) {
      return NextResponse.json(
        { error: "A channel with this name already exists in the group" },
        { status: 409 }
      )
    }

    // Create the new channel
    const channel = await prisma.Channel.create({
      data: {
        name,
        description,
        type: type || "TEXT",
        group: {
          connect: { id: groupId }
        }
      }
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error("Error creating channel:", error)
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    )
  }
} 