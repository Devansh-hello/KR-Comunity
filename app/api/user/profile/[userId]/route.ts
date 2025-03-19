import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log("GET /api/user/profile/[userId] - Request received for userId:", params.userId);
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", JSON.stringify({
      authenticated: !!session,
      userId: session?.user?.id,
      requestedId: params.userId
    }));
    
    // Check if user is authenticated
    if (!session?.user) {
      console.log("Unauthorized access attempt");
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }
    
    // Ensure users can only access their own profile data
    if (session.user.id !== params.userId) {
      console.log(`Forbidden: session user ID (${session.user.id}) doesn't match requested ID (${params.userId})`);
      return new NextResponse(
        JSON.stringify({ message: "Forbidden" }),
        { status: 403 }
      );
    }
    
    console.log("Fetching user data from database for ID:", params.userId);
    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      console.log("User not found in database:", params.userId);
      return new NextResponse(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }
    
    console.log("User data found, returning response");
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to fetch user profile" }),
      { status: 500 }
    );
  }
} 