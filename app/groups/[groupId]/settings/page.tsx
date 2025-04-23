"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ImageUpload"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Link from "next/link"

const groupFormSchema = z.object({
  name: z.string().min(3, {
    message: "Group name must be at least 3 characters.",
  }).max(50, {
    message: "Group name must not be longer than 50 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not be longer than 500 characters.",
  }),
  isPrivate: z.boolean().default(false),
  image: z.string().optional(),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

interface Group {
  id: string
  name: string
  description: string
  image: string | null
  isPrivate: boolean
  ownerId: string
}

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const groupId = params.groupId as string

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
      image: "",
    },
  })

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch group")
        }
        
        const data = await response.json()
        setGroup(data)

        // Set form values
        form.reset({
          name: data.name,
          description: data.description,
          isPrivate: data.isPrivate,
          image: data.image || "",
        })
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching group:", err)
        setError("Failed to load group settings")
        setLoading(false)
      }
    }
    
    if (groupId) {
      fetchGroup()
    }
  }, [groupId, form])

  const onSubmit = async (values: GroupFormValues) => {
    if (!session?.user || !group) {
      toast.error("You must be logged in to update the group")
      return
    }

    // Check if user is owner or admin
    if (group.ownerId !== session.user.id) {
      toast.error("You don't have permission to update this group")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update group")
      }

      toast.success("Group settings updated successfully")
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Error updating group:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update group")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!session?.user || !group) {
      toast.error("You must be logged in to delete the group")
      return
    }

    // Check if user is owner
    if (group.ownerId !== session.user.id) {
      toast.error("Only the group owner can delete this group")
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete group")
      }

      toast.success("Group deleted successfully")
      router.push("/groups")
    } catch (error) {
      console.error("Error deleting group:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete group")
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

  if (error || !group) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{error || "Group not found"}</h1>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    )
  }

  // Check if user is authorized to view settings
  if (session?.user?.id !== group.ownerId) {
    return (
      <div className="container max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to edit this group's settings.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href={`/groups/${groupId}`}>
            <Button>Return to Group</Button>
          </Link>
        </div>
      </div>
    )
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
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>
            Update your group's information and preferences
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Image</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value ? [field.value] : []} 
                        disabled={isSubmitting}
                        onChange={(url) => field.onChange(url)}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormDescription>
                      This image will be displayed as your group's avatar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Study Group" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of your group that members will see.
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this group is about..."
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the group's purpose.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private Group</FormLabel>
                      <FormDescription>
                        When enabled, only approved members can join this group.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full justify-between">
                <Button type="button" variant="outline" onClick={() => router.push(`/groups/${groupId}`)}>
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
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the group 
                        and all its channels, and remove all members.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Group"
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