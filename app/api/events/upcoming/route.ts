import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching upcoming events...")
    const now = new Date()
    
    const upcomingEvents = await prisma.event.findMany({
      where: {
        deadline: {
          gte: now
        }
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        location: true,
        deadline: true,
        capacity: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      },
      take: 3
    })
    
    console.log("Found upcoming events:", upcomingEvents)
    
    const formattedEvents = upcomingEvents.map(event => ({
      id: event.id,
      title: event.title,
      content: event.content,
      category: event.category,
      location: event.location,
      deadline: event.deadline,
      capacity: event.capacity,
      image: event.image,
      registered: event._count.registrations,
      author: event.author
    }))
    
    console.log("Formatted events:", formattedEvents)
    
    if (formattedEvents.length === 0) {
      console.log("No upcoming events found")
    }
    
    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error("Failed to fetch upcoming events:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming events", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 