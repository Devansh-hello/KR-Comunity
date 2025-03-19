"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import QRCode component to avoid SSR issues
const QRCode = dynamic(() => import("./QRCode").then(mod => mod.QRCode), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[300px] h-[300px] bg-muted">
      <QrCode className="h-8 w-8 animate-pulse" />
    </div>
  )
})

interface QRCodeDialogProps {
  eventId: string
  eventTitle: string
}

export function QRCodeDialog({ eventId, eventTitle }: QRCodeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const checkInUrl = `${window.location.origin}/events/${eventId}/check-in/mobile`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <QrCode className="w-4 h-4 mr-2" /> Check-in QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event Check-in QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to access the check-in page for {eventTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <QRCode
            data={checkInUrl}
            size={300}
            className="rounded-lg overflow-hidden"
          />
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <p>URL: {checkInUrl}</p>
          <p className="mt-2">Scan to access the mobile check-in page for organizers</p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 