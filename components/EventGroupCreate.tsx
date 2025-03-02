"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface EventGroupCreateProps {
  eventId: string
  onSuccess?: () => void
}

export function EventGroupCreate({ eventId, onSuccess }: EventGroupCreateProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error()
      toast.success("Group created successfully")
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto dark:bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Users className="h-6 w-6 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Create Event Group
              </span>
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                placeholder="Group Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full transition-colors dark:bg-background/50"
                required
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                placeholder="Group Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px] w-full transition-colors dark:bg-background/50"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
} 