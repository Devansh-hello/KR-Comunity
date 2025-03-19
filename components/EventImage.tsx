"use client"
import { useState } from 'react'
import Image from 'next/image'

interface EventImageProps {
  src: string
  alt: string
  className?: string
  height?: string
}

export function EventImage({ 
  src, 
  alt, 
  className = '', 
  height = 'h-48'
}: EventImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg")
  
  return (
    <div className={`relative w-full ${height} ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover rounded-t-lg"
        onError={() => setImgSrc("/placeholder.svg")}
        priority
      />
      {/* Optional category badge could go here */}
    </div>
  )
} 