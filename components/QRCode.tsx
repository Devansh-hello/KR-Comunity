"use client"

import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"

interface QRCodeProps {
  data: string
  size?: number
  logo?: string
  className?: string
}

export function QRCode({ data, size = 300, logo, className = "" }: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling>()

  useEffect(() => {
    if (!qrRef.current) return

    qrCode.current = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data,
      dotsOptions: {
        color: "#000000",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10
      },
      ...(logo && {
        image: logo,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10
        }
      })
    })

    qrCode.current.append(qrRef.current)

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = ""
      }
    }
  }, [data, size, logo])

  return <div ref={qrRef} className={className} />
} 