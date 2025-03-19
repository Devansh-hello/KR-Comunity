"use client"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { notFound, useParams } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Users, Calendar, MapPin, Tag, Clock, Smartphone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
// Comment out the problematic import
// import { EventQRCode } from "@/components/ui/EventQRCode"
import { useState, useEffect } from "react"
import { PageLayout } from "@/components/ui/page-layout"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { ResponsiveCard } from "@/components/ui/responsive-card"
import { GlowButton } from "@/components/ui/glow-button"
import { Loading } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

// Create a client EventImage component
function EventDetailImage({ src, alt }: { src: string, alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg")
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full aspect-[1/1.2] md:aspect-[4/3] lg:aspect-[1/1] overflow-hidden rounded-lg shadow-md">
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-contain bg-black/5"
          onError={() => setImgSrc("/placeholder.svg")}
          sizes="(max-width: 768px) 100vw, 700px"
          priority
          quality={100}
        />
      </div>
    </div>
  )
}

// Basic event interface
interface EventDetail {
  id: string
  title: string
  content: string
  location: string
  deadline: string
  category: string
  image?: string
  createdAt: string
  author?: {
    id: string
    name: string
  }
  updatedAt?: string
  _count?: {
    registrations: number
  }
  capacity?: number
}

// Related event interface
interface RelatedEvent {
  id: string
  title: string
  content: string
  location: string
  deadline: string
  category: string
  image?: string
}

// Simplify the approach to formatting content
const formatEventContent = (content: string) => {
  // Apply very basic formatting that preserves paragraphs and line breaks
  return content
    .replace(/\n\n/g, '</p><p class="event-paragraph">') // Double line breaks become paragraph breaks
    .replace(/\n/g, '<br/>') // Single line breaks become <br/>
    .replace(/<p>/g, '<p class="event-paragraph">')
    .replace(/<h2>/g, '<h2 class="event-heading">')
    .replace(/<ul>/g, '<ul class="event-list">')
    .replace(/<li>/g, '<li class="event-list-item">')
    .replace(/<strong>/g, '<strong class="event-strong">');
};

export default function EventPage() {
  const params = useParams<{ eventId: string }>()
  const { eventId } = params
  
  const { data: session } = useSession()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedInCount, setCheckedInCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchEventData() {
      try {
        setLoading(true)
        
        // Fetch the main event
        const eventResponse = await fetch(`/api/events/${eventId}`)
        
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event')
        }
        
        const eventData = await eventResponse.json()
        setEvent(eventData)
        
        // Fetch checked-in count if the event exists
        const checkedInResponse = await fetch(`/api/events/${eventId}/check-in/count`)
        if (checkedInResponse.ok) {
          const { count } = await checkedInResponse.json()
          setCheckedInCount(count)
        }
        
        // Fetch related events (optional)
        try {
          const relatedResponse = await fetch(`/api/events/related?id=${eventId}&limit=3`)
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            if (Array.isArray(relatedData) && relatedData.length > 0) {
              setRelatedEvents(relatedData)
            }
          }
        } catch (relatedError) {
          console.error("Error fetching related events:", relatedError)
          // Non-critical error, don't set the main error state
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load event data. Please try again later.")
        
        // Fallback data for development/preview
        if (process.env.NODE_ENV !== "production") {
          setEvent({
            id: eventId,
            title: "ROBORUSH 1.0 – WHERE TECHNOLOGY MEETS INNOVATION!",
            content: `
              <p>Techies, gear up for ROBORUSH 1.0 – a high-speed, high-energy Robot Race & Project Showcase where innovation meets adrenaline!</p>
              
              <h2>Event Highlights</h2>
              <ul>
                <li><strong>Robot Race</strong> – hit the track, and race to victory! Speed, control, and precision are all that matter!</li>
                <li><strong>Project Showcase</strong> – unveil your tech innovations to industry experts and win big!</li>
                <li><strong>Tech Talks</strong> – gain insights from industry leaders and expand your knowledge!</li>
                <li><strong>Networking</strong> – connect with fellow tech enthusiasts and potential collaborators!</li>
              </ul>
              
              <h2>Registration Details</h2>
              <p>Registration Fee: ₹500 per team (up to 4 members)<br>
              Last Date to Register: April 30, 2023</p>
              
              <h2>Prizes Worth</h2>
              <p>1st Prize: ₹15,000<br>
              2nd Prize: ₹10,000<br>
              3rd Prize: ₹5,000</p>
              
              <p>Don't miss this opportunity to showcase your robotics skills and win exciting prizes!</p>
            `,
            location: "Moot Court",
            deadline: "2025-04-26T00:00:00.000Z",
            category: "TECHNICAL",
            image: "https://images.unsplash.com/photo-1538506392157-218c11f95109?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            createdAt: "2023-03-01T00:00:00.000Z"
          })
          
          setRelatedEvents([
            {
              id: "event1",
              title: "Hackathon 2023",
              content: "Join us for a 24-hour coding challenge to build innovative solutions for real-world problems.",
              location: "Main Building",
              deadline: "2023-05-15T00:00:00.000Z",
              category: "CODING",
              image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            },
            {
              id: "event2",
              title: "AI Workshop Series",
              content: "Learn about artificial intelligence fundamentals and applications in this hands-on workshop series.",
              location: "Tech Lab",
              deadline: "2023-06-10T00:00:00.000Z",
              category: "WORKSHOP",
              image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            },
            {
              id: "event3",
              title: "Design Thinking Bootcamp",
              content: "A two-day intensive bootcamp on design thinking methodology for problem-solving.",
              location: "Design Studio",
              deadline: "2023-07-20T00:00:00.000Z",
              category: "DESIGN",
              image: "https://images.unsplash.com/photo-1509908900993-1de5884e4592?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
            }
          ])
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchEventData()
  }, [eventId])

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <Loading variant="glow" size="lg" text="Loading event details" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <ResponsiveContainer>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error || "Event not found"}</p>
          <GlowButton 
            onClick={() => window.location.href = "/events"}
            glow="pulse"
            effect="shine"
          >
            Back to Events
          </GlowButton>
        </div>
      </ResponsiveContainer>
    )
  }

  const isAuthor = session?.user && event.author?.id === (session.user as any).id

  // Format the date
  const formattedDate = format(new Date(event.deadline), 'MMMM d, yyyy')

  return (
    <div className="pb-16">
      <div className="bg-gradient-to-b from-primary/5 to-background pt-12 pb-8 mb-8 border-b">
        <ResponsiveContainer>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                className="flex items-center gap-1 text-sm" 
                onClick={() => router.push("/events")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back to Events
              </Button>
            </div>
            
            <Badge className="w-fit mb-2" variant="outline">{event.category}</Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{event.title}</h1>
            
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
      
      <ResponsiveContainer>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="w-full lg:w-2/3">
            {event.image && (
              <div className="mb-10 rounded-lg overflow-hidden border max-w-md mx-auto">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            <div className="content-wrapper p-4 rounded-md bg-card/50">
              <div 
                className="content-text"
                dangerouslySetInnerHTML={{ 
                  __html: event.content
                }}
              />
            </div>
            
            <style jsx global>{`
              .content-wrapper {
                font-size: 16px;
                line-height: 1.8;
              }
              
              .content-text p {
                margin-bottom: 2rem;
                white-space: pre-wrap;
              }
              
              .content-text h2 {
                font-size: 1.5rem;
                font-weight: 700;
                margin-top: 3rem;
                margin-bottom: 1.5rem;
              }
              
              .content-text ul {
                margin: 1.5rem 0;
                padding-left: 2rem;
                list-style-type: disc;
              }
              
              .content-text li {
                margin-bottom: 1rem;
                padding-left: 0.5rem;
              }
              
              .content-text strong {
                font-weight: 600;
                color: hsl(var(--primary));
              }
              
              .content-text br {
                display: block;
                content: "";
                margin-top: 1rem;
              }
            `}</style>
            
            <div className="mt-16 flex justify-center sm:justify-start">
              <GlowButton
                className="px-12 py-5 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-full border-2 border-primary"
                glow="intense"
                effect="shine"
                onClick={() => router.push(`/events/${eventId}/register`)}
              >
                Register Now
              </GlowButton>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="rounded-lg border p-5 bg-card/50 backdrop-blur-sm">
              <h3 className="font-medium text-lg mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Date</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Location</span>
                  <span className="font-medium">{event.location}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Category</span>
                  <Badge variant="outline" className="mt-1 bg-primary/10">
                    {event.category}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Share section */}
            <div className="rounded-lg border p-5 bg-card/50 backdrop-blur-sm">
              <h3 className="font-medium text-lg mb-4">Share Event</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Copy Link
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
      
      {/* Related events section */}
      {relatedEvents.length > 0 && (
        <div className="mt-16 bg-muted/30 py-12">
          <ResponsiveContainer>
            <h2 className="text-2xl font-bold mb-8">Related Events</h2>
            
            <ResponsiveGrid 
              cols={{ default: 1, sm: 2, lg: 3 }}
              gap="lg"
            >
              {relatedEvents.map((relatedEvent) => (
                <ResponsiveCard
                  key={relatedEvent.id}
                  title={relatedEvent.title}
                  description={relatedEvent.content.substring(0, 120).replace(/<[^>]*>/g, '') + '...'}
                  category={relatedEvent.category}
                  date={format(new Date(relatedEvent.deadline), 'MMMM d, yyyy')}
                  location={relatedEvent.location}
                  image={relatedEvent.image}
                  href={`/events/${relatedEvent.id}`}
                  withTilt={true}
                  className="bg-card shadow-md hover:shadow-lg transition-all duration-200"
                />
              ))}
            </ResponsiveGrid>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
} 