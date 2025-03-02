"use client"
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  currentImage?: string
}

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState(currentImage)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      onImageSelect(file)
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-40 mx-auto object-contain"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive 
              ? "Drop the image here" 
              : "Drag and drop an image, or click to select"}
          </p>
        </div>
      )}
    </div>
  )
} 