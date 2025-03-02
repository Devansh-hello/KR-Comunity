"use client"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import { toast } from "sonner"

export function EventCheckIn({ eventId }: { eventId: string }) {
  const [showScanner, setShowScanner] = useState(false)

  // Generate unique check-in code
  const checkInCode = `${eventId}-${Date.now()}`

  const handleScan = async (code: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })
      
      if (!response.ok) throw new Error()
      toast.success("Check-in successful!")
    } catch (error) {
      toast.error("Check-in failed")
    }
  }

  return (
    <div>
      <QRCodeSVG value={checkInCode} />
      {/* QR code scanner component */}
    </div>
  )
} 