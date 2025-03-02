"use client"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

interface QRCodeGeneratorProps {
  registrationId: string
  eventId: string
}

export function QRCodeGenerator({ registrationId, eventId }: QRCodeGeneratorProps) {
  const [qrValue] = useState(() => {
    return JSON.stringify({
      registrationId,
      eventId,
      timestamp: Date.now(),
    })
  })

  const handleDownload = () => {
    const svg = document.getElementById("qr-code")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `event-qr-${registrationId}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-sm mx-auto dark:bg-background/95 sm:rounded-lg rounded-none sm:mt-0 -mx-4 sm:mx-auto">
        <CardContent className="flex flex-col items-center gap-4 p-4 sm:p-6">
          <motion.div 
            className="bg-white dark:bg-zinc-800 p-3 sm:p-4 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <QRCodeSVG
              id="qr-code"
              value={qrValue}
              size={window.innerWidth < 640 ? 160 : 200}
              level="H"
              includeMargin
              className="dark:bg-white dark:rounded-md dark:p-2"
            />
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="w-full transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 