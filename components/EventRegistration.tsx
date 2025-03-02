"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { QRCodeGenerator } from "./QRCodeGenerator"

interface EventRegistrationProps {
  eventId: string
  capacity: number
  registered: number
  deadline: string
}

export function EventRegistration({ 
  eventId, 
  capacity, 
  registered, 
  deadline 
}: EventRegistrationProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [registrationId, setRegistrationId] = useState<string>()
  const [formData, setFormData] = useState({
    fullName: "",
    rollNo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error("Please sign in to register")
      return
    }

    if (registered >= capacity) {
      toast.error("Event is full")
      return
    }

    if (new Date() > new Date(deadline)) {
      toast.error("Registration deadline has passed")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setRegistrationId(data.id)
      toast.success("Registration successful")
    } catch (error) {
      toast.error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  if (registrationId) {
    return <QRCodeGenerator registrationId={registrationId} eventId={eventId} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto dark:bg-background/95 backdrop-blur-sm sm:rounded-lg rounded-none sm:mt-0 -mx-4 sm:mx-auto">
        <CardHeader className="space-y-1 sm:space-y-2">
          <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Event Registration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {registered} / {capacity} spots filled
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {registrationId ? (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <QRCodeGenerator registrationId={registrationId} eventId={eventId} />
              <p className="text-muted-foreground text-center text-sm md:text-base">
                Save this QR code for check-in
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full transition-colors dark:bg-background/50"
                  required
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  placeholder="Roll Number"
                  value={formData.rollNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNo: e.target.value }))}
                  className="w-full transition-colors dark:bg-background/50"
                  required
                />
              </motion.div>
              <motion.div 
                className="pt-4"
                whileHover={{ scale: 1.01 }}
              >
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {loading ? "Registering..." : "Register for Event"}
                </Button>
              </motion.div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 