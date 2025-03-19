import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const eventId = url.searchParams.get("id")
    const limitParam = url.searchParams.get("limit") || "3"
    const limit = parseInt(limitParam, 10)
    
    // Validate parameters
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      )
    }
    
    // Find the current event to get its category
    const currentEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { category: true }
    })
    
    if (!currentEvent) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }
    
    // Find related events in the same category, excluding the current event
    const relatedEvents = await prisma.event.findMany({
      where: {
        AND: [
          { category: currentEvent.category },
          { id: { not: eventId } },
          { deadline: { gte: new Date() } } // Only future events
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        location: true,
        deadline: true,
        category: true,
        capacity: true,
        registered: true
      },
      orderBy: { deadline: 'asc' },
      take: limit
    })
    
    // If we don't have enough related events in the same category,
    // fill with other upcoming events
    if (relatedEvents.length < limit) {
      const additionalCount = limit - relatedEvents.length
      
      const otherEvents = await prisma.event.findMany({
        where: {
          AND: [
            { category: { not: currentEvent.category } },
            { id: { not: eventId } },
            { deadline: { gte: new Date() } },
            { id: { notIn: relatedEvents.map(e => e.id) } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          image: true,
          location: true,
          deadline: true,
          category: true,
          capacity: true,
          registered: true
        },
        orderBy: { deadline: 'asc' },
        take: additionalCount
      })
      
      // Combine the results
      return NextResponse.json([...relatedEvents, ...otherEvents])
    }
    
    return NextResponse.json(relatedEvents)
  } catch (error) {
    console.error("Error fetching related events:", error)
    return NextResponse.json(
      { message: "An error occurred while fetching related events" },
      { status: 500 }
    )
  }
} 