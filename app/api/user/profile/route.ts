import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      )
    }

    const { username, name, bio, image } = await req.json()
    const userId = session.user.id

    // Check if the username already exists for another user
    if (username) {
      const existingUser = await db.user.findFirst({
        where: {
          username,
          id: { not: userId },
        },
      })

      if (existingUser) {
        return new NextResponse(
          JSON.stringify({ message: "Username already taken" }),
          { status: 400 }
        )
      }
    }

    // Handle base64 image data if present
    let imageUrl = image
    if (image && image.startsWith('data:image')) {
      // You might want to store the image in a storage service like AWS S3
      // For now, we'll just pass the base64 data directly
      // In a production app, you would:
      // 1. Upload the image to a storage service
      // 2. Store the URL to the uploaded image
      // imageUrl = await uploadImageToStorage(image)
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        username,
        name,
        bio,
        image: imageUrl,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return new NextResponse(
      JSON.stringify({ message: "Failed to update profile" }),
      { status: 500 }
    )
  }
} 