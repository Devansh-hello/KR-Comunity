import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Calendar, MapPin, Tag, Clock, CheckCircle2, XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "My Registrations",
  description: "View your event registrations",
}

interface ExtendedUser {
  id: string
}

interface ExtendedSession {
  user?: ExtendedUser
}

export default async function RegistrationsPage() {
  const session = await getServerSession() as ExtendedSession
  
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/registrations")
  }
  
  const registrations = await prisma.registration.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          image: true,
          location: true,
          category: true,
          deadline: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <p className="text-muted-foreground">
          View all the events you have registered for.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {registrations.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardHeader>
                <CardTitle>No Registrations Found</CardTitle>
                <CardDescription>
                  You haven't registered for any events yet.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          registrations.map((registration) => (
            <Card key={registration.id} className="overflow-hidden flex flex-col">
              <CardHeader className="p-4">
                <CardTitle className="text-xl truncate">{registration.event.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(registration.event.deadline.toISOString().split('T')[0])}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3 flex-grow">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.event.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(registration.createdAt.toISOString().split('T')[0])}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 font-medium">
                    {registration.checkedIn ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Checked In
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Not Checked In
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/events/${registration.event.id}`}>View Event</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 