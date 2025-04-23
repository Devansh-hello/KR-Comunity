import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { value } = await req.json()
    const postId = params.postId

    // We'll use a transaction to ensure both vote and post upvotes are updated consistently
    const result = await prisma.$transaction(async (tx) => {
      // Check if user has already voted
      const existingVote = await tx.vote.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      })

      let voteChange = 0;

      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote if clicking the same button
          await tx.vote.delete({
            where: {
              userId_postId: {
                userId: session.user.id,
                postId,
              },
            },
          })
          voteChange = -existingVote.value; // Reverses the previous vote's effect
        } else {
          // Update vote if changing from upvote to downvote or vice versa
          await tx.vote.update({
            where: {
              userId_postId: {
                userId: session.user.id,
                postId,
              },
            },
            data: { value },
          })
          voteChange = value - existingVote.value; // The net change in votes
        }
      } else {
        // Create new vote
        await tx.vote.create({
          data: {
            value,
            userId: session.user.id,
            postId,
          },
        })
        voteChange = value; // Adding a new vote
      }

      // Update the upvotes counter on the post
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          upvotes: {
            increment: voteChange
          }
        },
        select: {
          upvotes: true
        }
      });

      return { success: true, newUpvotes: updatedPost.upvotes };
    });

    console.log(`Vote processed successfully. New upvotes count: ${result.newUpvotes}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    )
  }
} 