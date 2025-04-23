"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
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

export default function CreateChannelPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const groupId = params.groupId as string

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "TEXT",
    },
  })

  const onSubmit = async (values: ChannelFormValues) => {
    if (!session?.user) {
      toast.error("You must be logged in to create a channel")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create channel")
      }

      const channel = await response.json()
      toast.success("Channel created successfully")
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Error creating channel:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create channel")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <Link 
          href={`/groups/${groupId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to group
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a Channel</CardTitle>
          <CardDescription>
            Create a new channel for your group members to communicate
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
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/groups/${groupId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Channel"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
} 