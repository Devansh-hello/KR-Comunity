"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ProfileSettings() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: session?.user?.username || "",
    name: session?.user?.name || "",
    bio: session?.user?.bio || "",
    image: session?.user?.image || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error()
      await update()
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.image} />
              <AvatarFallback>{formData.name?.[0]}</AvatarFallback>
            </Avatar>
            <Input
              type="url"
              placeholder="Profile Image URL"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
            />
            <p className="text-sm text-muted-foreground">
              This is your unique username that others will see
            </p>
          </div>

          <Input
            placeholder="Display Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />

          <Textarea
            placeholder="Bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="min-h-[100px]"
          />

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 