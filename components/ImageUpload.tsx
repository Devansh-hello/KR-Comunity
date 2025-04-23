"use client"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  isCircle?: boolean
}

export function ImageUpload({ value, onChange, disabled = false, isCircle = false }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setLoading(false)
    }
  }, [onChange])

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="imageUpload"
        disabled={disabled}
      />
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Upload"
            className={`w-full h-[200px] object-cover ${isCircle ? 'rounded-full' : 'rounded-lg'}`}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={`w-full h-[200px] ${isCircle ? 'rounded-full' : ''}`}
          disabled={loading || disabled}
          onClick={() => document.getElementById("imageUpload")?.click()}
        >
          <ImagePlus className="h-5 w-5 mr-2" />
          {loading ? "Uploading..." : "Upload Image"}
        </Button>
      )}
    </div>
  )
} 