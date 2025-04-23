import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { sendMessageToChannel } from "../sse/route" // Import the SSE helper function

// GET: Fetch messages for a channel
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

    // Check if channel exists and belongs to the group
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
        groupId,
      },
    })

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 })
    }

    // Fetch messages for the channel
    const messages = await prisma.channelMessage.findMany({
      where: {
        channelId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attachments: true,
        reactions: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Limit the number of messages
    })

    // Get all the user IDs from reactions to fetch in a single query
    const userIds = new Set<string>()
    messages.forEach(message => {
      message.reactions.forEach(reaction => {
        userIds.add(reaction.userId)
      })
    })

    // Fetch all users in a single query
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: Array.from(userIds)
        }
      },
      select: {
        id: true,
        name: true,
      }
    })

    // Create a map for quick lookup
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user.id, user)
    })

    // Add user info to reactions
    const messagesWithUsers = messages.map(message => {
      const enhancedReactions = message.reactions.map(reaction => {
        return {
          ...reaction,
          user: userMap.get(reaction.userId) || { id: reaction.userId, name: "Unknown" }
        }
      })

      return {
        ...message,
        reactions: enhancedReactions
      }
    })

    return NextResponse.json(messagesWithUsers)
  } catch (error) {
    console.error("[CHANNEL_MESSAGES_GET]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// POST: Create a new message in the channel
export async function POST(
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
    const { content, attachments } = body

    // Messages can be empty if they have attachments
    if ((!content || typeof content !== "string") && (!attachments || !attachments.length)) {
      return new NextResponse("Message must contain content or attachments", { status: 400 })
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

    // Check if channel exists and belongs to the group
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
        groupId,
      },
    })

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 })
    }

    // For announcement channels, only admins can post
    if (channel.type === "ANNOUNCEMENT") {
      const isAdmin = membership.role === "ADMIN" || membership.role === "OWNER"
      
      if (!isAdmin) {
        return new NextResponse("Only admins can post in announcement channels", { status: 403 })
      }
    }

    // Create the message with attachments if provided
    const message = await prisma.channelMessage.create({
      data: {
        content: content || "",
        channel: {
          connect: { id: channelId },
        },
        author: {
          connect: { id: session.user.id },
        },
        ...(attachments && attachments.length > 0 && {
          attachments: {
            create: attachments.map((attachment: any) => ({
              url: attachment.url,
              type: attachment.type,
              filename: attachment.filename,
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attachments: true,
        reactions: true,
      },
    })

    // Log before broadcasting
    console.log(`Message created with ID ${message.id}, broadcasting to channel ${channelId}`);

    // Broadcast the message to all connected clients
    sendMessageToChannel(channelId, {
      type: 'new_message',
      message
    });

    // Log after broadcasting
    console.log('Broadcast complete');

    return NextResponse.json(message)
  } catch (error) {
    console.error("[CHANNEL_MESSAGES_POST]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
} 