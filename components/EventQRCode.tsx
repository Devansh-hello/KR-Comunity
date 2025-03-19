"use client"

import { QRCodeDialog } from "@/components/QRCodeDialog"

interface EventQRCodeProps {
  eventId: string
  eventTitle: string
}

export function EventQRCode({ eventId, eventTitle }: EventQRCodeProps) {
  return <QRCodeDialog eventId={eventId} eventTitle={eventTitle} />
} 