"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useSession } from "next-auth/react"

import { PageLayout } from "@/components/ui/page-layout"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { GlowButton } from "@/components/ui/glow-button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

// Form schema for registration
const registrationSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  rollNo: z.string().min(1, { message: "Roll number is required" }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to register"
  })
})

type RegistrationFormValues = z.infer<typeof registrationSchema>

interface EventDetail {
  id: string
  title: string
  deadline: string
  location: string
  category: string
  image?: string
  capacity: number
  _count?: {
    registrations: number
  }
}

export default function EventRegistrationPage() {
  const router = useRouter()
  const params = useParams<{ eventId: string }>()
  const { eventId } = params
  const { data: session, status } = useSession()
  
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Set up form with validation
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNo: "",
      termsAccepted: false
    }
  })
  
  // Fetch event data
  useEffect(() => {
    async function fetchEventData() {
      try {
        setLoading(true)
        
        // Fetch the event
        const eventResponse = await fetch(`/api/events/${eventId}`)
        
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event')
        }
        
        const eventData = await eventResponse.json()
        setEvent(eventData)
        
        // If there's a logged in user, pre-fill their details
        if (status === "authenticated" && session?.user) {
          form.setValue('name', (session.user as any).name || "")
          form.setValue('email', (session.user as any).email || "")
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load event data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchEventData()
  }, [eventId, session, status, form])
  
  // Handle form submission
  async function onSubmit(data: RegistrationFormValues) {
    try {
      setSubmitting(true)
      
      // Check if event is at capacity
      if (event?._count?.registrations && event.capacity && 
          event._count.registrations >= event.capacity) {
        toast.error("This event has reached its maximum capacity")
        return
      }
      
      // Submit registration
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          rollNo: data.rollNo,
          eventId: eventId
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }
      
      // Success
      toast.success("Registration successful!")
      
      // Redirect to the event page
      setTimeout(() => {
        router.push(`/events/${eventId}?registered=true`)
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      toast.error((error as Error).message || "Registration failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <Loading variant="glow" size="lg" text="Loading registration form" />
      </div>
    )
  }
  
  // Error state
  if (error || !event) {
    return (
      <ResponsiveContainer>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error || "Event not found"}</p>
          <GlowButton 
            onClick={() => router.push("/events")}
            glow="pulse"
            effect="shine"
          >
            Back to Events
          </GlowButton>
        </div>
      </ResponsiveContainer>
    )
  }
  
  // Check if event is full
  const isEventFull = event._count?.registrations && event.capacity && 
                      event._count.registrations >= event.capacity
  
  // Format the date
  const formattedDate = format(new Date(event.deadline), 'MMMM d, yyyy')
  
  return (
    <div className="pb-16">
      <div className="bg-background min-h-screen">
        <PageLayout
          title={`Register for ${event.title}`}
          description="Fill out the form below to register for this event"
          backUrl={`/events/${eventId}`}
          backLabel="Back to Event"
          withSpotlight={false}
          withAnimation={true}
          image=""
        >
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              {isEventFull ? (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Registration Closed</h2>
                  <p className="text-muted-foreground">
                    This event has reached its maximum capacity of {event.capacity} participants.
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push(`/events/${eventId}`)}
                    variant="outline"
                  >
                    Return to Event Details
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 mb-6">
                      <h2 className="text-xl font-semibold mb-4">Registration Form</h2>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="rollNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Roll No</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your roll number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="termsAccepted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I agree to the terms and conditions
                                </FormLabel>
                                <FormDescription>
                                  By registering, you agree to our event policies and privacy terms.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/events/${eventId}`)}
                      >
                        Cancel
                      </Button>
                      <GlowButton
                        type="submit"
                        glow="default"
                        effect="shine"
                        disabled={submitting}
                      >
                        {submitting ? "Registering..." : "Register Now"}
                      </GlowButton>
                    </div>
                  </form>
                </Form>
              )}
              
              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>Need help? Contact event support at <span className="font-medium">support@krcommunity.com</span></p>
              </div>
            </div>
          </div>
        </PageLayout>
      </div>
    </div>
  )
} 