import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("Current session in session-check API:", session)
    
    return NextResponse.json({
      authenticated: !!session,
      session: session,
      sessionId: session?.user?.id || null,
      sessionEmail: session?.user?.email || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json(
      { 
        error: "Error checking session", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
} 