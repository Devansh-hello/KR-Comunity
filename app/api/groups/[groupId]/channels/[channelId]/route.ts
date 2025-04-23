import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

// GET: Fetch a single channel
export async function GET(
  req: Request,
  { params }: { params: { groupId: string; channelId: string } }
) {
  const { groupId, channelId } = params

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return new NextResponse("Access denied. You are not a member of this group.", { status: 403 })
    }

    // Fetch the channel
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
        groupId,
      },
    })

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 })
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error("[CHANNEL_GET]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// PATCH: Update a channel
export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string; channelId: string } }
) {
  const { groupId, channelId } = params

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, type } = body

    if (!name || typeof name !== "string") {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Check if user has admin permissions in the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!membership || (membership.role !== "ADMIN" && membership.role !== "OWNER")) {
      return new NextResponse("Access denied. You don't have permission to update this channel.", { status: 403 })
    }

    // Check if channel exists and belongs to the group
    const existingChannel = await prisma.channel.findUnique({
      where: {
        id: channelId,
        groupId,
      },
    })

    if (!existingChannel) {
      return new NextResponse("Channel not found", { status: 404 })
    }

    // Update the channel
    const updatedChannel = await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        name,
        description,
        type,
      },
    })

    return NextResponse.json(updatedChannel)
  } catch (error) {
    console.error("[CHANNEL_PATCH]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// DELETE: Remove a channel
export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string; channelId: string } }
) {
  const { groupId, channelId } = params

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has admin permissions in the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!membership || (membership.role !== "ADMIN" && membership.role !== "OWNER")) {
      return new NextResponse("Access denied. You don't have permission to delete this channel.", { status: 403 })
    }

    // Check if channel exists and belongs to the group
    const existingChannel = await prisma.channel.findUnique({
      where: {
        id: channelId,
        groupId,
      },
    })

    if (!existingChannel) {
      return new NextResponse("Channel not found", { status: 404 })
    }

    // Delete all messages in the channel first
    await prisma.channelMessage.deleteMany({
      where: {
        channelId,
      },
    })

    // Delete the channel
    await prisma.channel.delete({
      where: {
        id: channelId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CHANNEL_DELETE]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
} 