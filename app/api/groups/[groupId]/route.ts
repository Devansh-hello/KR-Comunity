import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Get a specific group by ID
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

    // Get the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
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
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
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

    // Check if the user can access this group (public or they are a member)
    const isMember = group.members.some(member => member.userId === session.user.id)
    
    if (group.isPrivate && !isMember) {
      return NextResponse.json(
        { error: "You don't have access to this group" },
        { status: 403 }
      )
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    )
  }
} 