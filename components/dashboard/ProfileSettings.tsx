"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUploader } from "@/components/ui/dropzone/ImageUploader"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

// Make the user prop optional
interface ProfileSettingsProps {
  user?: User
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [image, setImage] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize form data from user prop or session
  useEffect(() => {
    if (user && !isInitialized) {
      console.log("Initializing form from user prop:", user)
      setUsername(user.username || "")
      setName(user.name || "")
      setBio(user.bio || "")
      setImage(user.image || "")
      setIsInitialized(true)
    } else if (session?.user && !isInitialized) {
      console.log("Initializing form from session:", session.user)
      setUsername(session.user.username || "")
      setName(session.user.name || "")
      setBio(session.user.bio || "")
      setImage(session.user.image || "")
      setIsInitialized(true)
    }
  }, [user, session, isInitialized])

  // If no session or user, show a fallback UI
  if (!session && !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          bio,
          image,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update profile")
      }

      const data = await response.json()
      
      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          image: data.image,
        },
      })

      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={image} />
            <AvatarFallback>
              {name?.charAt(0) || session?.user?.email?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Upload a new profile picture
            </p>
          </div>
        </div>
        <ImageUploader 
          value={image} 
          onChange={setImage}
          className="mt-2" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display Name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Updating...
          </>
        ) : (
          "Update Profile"
        )}
      </Button>
    </form>
  )
} 