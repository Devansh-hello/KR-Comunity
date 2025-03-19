import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Running database debug check...")
    
    // Get total count of events
    const totalEvents = await prisma.event.count()
    
    // Get a sample of events regardless of deadline
    const sampleEvents = await prisma.event.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        deadline: true,
        createdAt: true
      }
    })
    
    // Get database timestamps
    const now = new Date()
    const dbNow = await prisma.$queryRaw`SELECT CURRENT_TIMESTAMP`
    
    return NextResponse.json({
      status: "success",
      totalEvents,
      sampleEvents,
      systemTime: now.toISOString(),
      databaseTime: dbNow,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  } catch (error) {
    console.error("Database debug check failed:", error)
    return NextResponse.json(
      { 
        status: "error",
        error: "Database debug check failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 