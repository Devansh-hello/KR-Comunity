"use client"
import { useState } from "react"
import { QrScanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Scan, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface QRCodeScannerProps {
  eventId: string
  onSuccess?: () => void
}

export function QRCodeScanner({ eventId, onSuccess }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleScan = async (data: string) => {
    if (!data) return

    try {
      const scannedData = JSON.parse(data)
      if (scannedData.eventId !== eventId) {
        toast.error("Invalid QR code for this event")
        return
      }

      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: scannedData.registrationId,
        }),
      })

      if (!response.ok) throw new Error()
      setSuccess(true)
      toast.success("Check-in successful")
      setTimeout(() => {
        setScanning(false)
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (error) {
      toast.error("Check-in failed")
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
          <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Event Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square w-full max-w-sm mx-auto"
              >
                {success ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-background/95 z-10"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </motion.div>
                ) : null}
                <div className="rounded-lg overflow-hidden">
                  <QrScanner
                    onDecode={handleScan}
                    onError={(error) => console.error(error)}
                    className="w-full h-full"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => setScanning(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  size="lg"
                >
                  <Scan className="mr-2 h-5 w-5" />
                  Start Scanning
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
} 