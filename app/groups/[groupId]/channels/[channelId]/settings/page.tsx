"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from "next/link"

const channelFormSchema = z.object({
  name: z.string().min(3, {
    message: "Channel name must be at least 3 characters.",
  }).max(30, {
    message: "Channel name must not be longer than 30 characters.",
  }),
  description: z.string().max(500, {
    message: "Description must not be longer than 500 characters.",
  }).optional(),
  type: z.enum(["TEXT", "VOICE", "ANNOUNCEMENT"], {
    required_error: "You need to select a channel type.",
  }),
})

type ChannelFormValues = z.infer<typeof channelFormSchema>

interface Channel {
  id: string
  name: string
  description: string | null
  type: "TEXT" | "VOICE" | "ANNOUNCEMENT"
  groupId: string
}

interface Group {
  id: string
  name: string
  ownerId: string
  members: {
    userId: string
    role: string
  }[]
}

export default function ChannelSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const groupId = params.groupId as string
  const channelId = params.channelId as string

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "TEXT",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch channel details
        const channelResponse = await fetch(`/api/groups/${groupId}/channels/${channelId}`)
        
        if (!channelResponse.ok) {
          if (channelResponse.status === 404) {
            setError("Channel not found")
          } else {
            setError("Failed to load channel")
          }
          setLoading(false)
          return
        }
        
        const channelData = await channelResponse.json()
        setChannel(channelData)

        // Set form values
        form.reset({
          name: channelData.name,
          description: channelData.description || "",
          type: channelData.type,
        })
        
        // Fetch group details to check permissions
        const groupResponse = await fetch(`/api/groups/${groupId}`)
        
        if (!groupResponse.ok) {
          setError("Failed to load group information")
          setLoading(false)
          return
        }
        
        const groupData = await groupResponse.json()
        setGroup(groupData)
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("An error occurred while loading the data")
        setLoading(false)
      }
    }
    
    if (groupId && channelId) {
      fetchData()
    }
  }, [groupId, channelId, form])

  const onSubmit = async (values: ChannelFormValues) => {
    if (!session?.user || !channel || !group) {
      toast.error("You must be logged in to update the channel")
      return
    }

    // Check if user is admin
    const isAdmin = group.members?.some(m => 
      m.userId === session.user.id && (m.role === "ADMIN" || m.role === "OWNER")
    )

    if (!isAdmin) {
      toast.error("You don't have permission to update this channel")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/channels/${channelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update channel")
      }

      toast.success("Channel settings updated successfully")
      router.push(`/groups/${groupId}/channels/${channelId}`)
    } catch (error) {
      console.error("Error updating channel:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update channel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteChannel = async () => {
    if (!session?.user || !channel || !group) {
      toast.error("You must be logged in to delete the channel")
      return
    }

    // Check if user is admin
    const isAdmin = group.members?.some(m => 
      m.userId === session.user.id && (m.role === "ADMIN" || m.role === "OWNER")
    )

    if (!isAdmin) {
      toast.error("You don't have permission to delete this channel")
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/channels/${channelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete channel")
      }

      toast.success("Channel deleted successfully")
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Error deleting channel:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete channel")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !channel || !group) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{error || "Channel not found"}</h1>
        <Link href={`/groups/${groupId}`}>
          <Button>Back to Group</Button>
        </Link>
      </div>
    )
  }

  // Check if user is admin
  const isAdmin = group.members?.some(m => 
    m.userId === session?.user?.id && (m.role === "ADMIN" || m.role === "OWNER")
  )

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="container max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to edit this channel's settings.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href={`/groups/${groupId}/channels/${channelId}`}>
            <Button>Return to Channel</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <Link 
          href={`/groups/${groupId}/channels/${channelId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to channel
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Channel Settings</CardTitle>
          <CardDescription>
            Update your channel's information
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. general-discussion" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of your channel that members will see.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this channel is about..."
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the channel's purpose.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Channel Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="TEXT" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Text Channel - For text-based conversations and discussions
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="VOICE" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Voice Channel - For voice conversations and meetings
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ANNOUNCEMENT" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Announcement Channel - For important group announcements
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push(`/groups/${groupId}/channels/${channelId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
              
              <div className="pt-4 border-t w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" type="button">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Channel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the channel 
                        and all its messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteChannel}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Channel"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
} 