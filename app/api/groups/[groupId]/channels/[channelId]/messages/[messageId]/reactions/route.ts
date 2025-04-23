import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { sendMessageToChannel } from "../../../sse/route" // Import the SSE helper function

// POST: Add a reaction to a message
export async function POST(
  req: Request,
  { params }: { params: { groupId: string; channelId: string; messageId: string } }
) {
  const { groupId, channelId, messageId } = params

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { emoji } = await req.json()

    if (!emoji || typeof emoji !== "string") {
      return new NextResponse("Emoji is required", { status: 400 })
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

    // Check if message exists
    const message = await prisma.channelMessage.findUnique({
      where: {
        id: messageId,
        channelId,
      },
      include: {
        channel: {
          select: {
            groupId: true,
          },
        },
      },
    })

    if (!message || message.channel.groupId !== groupId) {
      return new NextResponse("Message not found", { status: 404 })
    }

    // Check if the user already reacted with this emoji
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji,
      },
    })

    if (existingReaction) {
      // Remove the reaction (toggle behavior)
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id,
        },
      })
      
      // Broadcast reaction removal
      sendMessageToChannel(channelId, {
        type: 'reaction_removed',
        messageId,
        reactionId: existingReaction.id,
        userId: session.user.id,
        emoji
      });
      
      return NextResponse.json({ removed: true, emoji })
    }

    // Add the reaction
    const reaction = await prisma.messageReaction.create({
      data: {
        emoji,
        messageId: messageId,
        userId: session.user.id,
      },
    })

    // Get user details to return
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    })

    // Prepare the reaction with user data
    const reactionWithUser = {
      ...reaction,
      user,
    };

    // Broadcast the new reaction
    sendMessageToChannel(channelId, {
      type: 'reaction_added',
      messageId,
      reaction: reactionWithUser
    });

    // Return combined data
    return NextResponse.json(reactionWithUser)
  } catch (error) {
    console.error("[MESSAGE_REACTION_POST]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// GET: Get all reactions for a message
export async function GET(
  req: Request,
  { params }: { params: { groupId: string; channelId: string; messageId: string } }
) {
  const { groupId, channelId, messageId } = params

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

    // Check if message exists
    const message = await prisma.channelMessage.findUnique({
      where: {
        id: messageId,
        channelId,
      },
      include: {
        channel: {
          select: {
            groupId: true,
          },
        },
      },
    })

    if (!message || message.channel.groupId !== groupId) {
      return new NextResponse("Message not found", { status: 404 })
    }

    // Get all reactions for the message
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId,
      },
    })

    // Get user details for each reaction
    const reactionsWithUsers = await Promise.all(
      reactions.map(async (reaction) => {
        const user = await prisma.user.findUnique({
          where: {
            id: reaction.userId,
          },
          select: {
            id: true,
            name: true,
          },
        })
        return {
          ...reaction,
          user,
        }
      })
    )

    return NextResponse.json(reactionsWithUsers)
  } catch (error) {
    console.error("[MESSAGE_REACTION_GET]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
} 