import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { UTApi } from "uploadthing/server"

// Create a new instance of the UploadThing API
const utapi = new UTApi()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse("File too large (max 10MB)", { status: 400 })
    }
    
    // Get the file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    
    // Validate file type based on extension
    const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const allowedFileExtensions = [...allowedImageExtensions, 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip']
    
    if (!allowedFileExtensions.includes(fileExtension)) {
      return new NextResponse("File type not allowed", { status: 400 })
    }
    
    // Determine whether this is an image or a regular file
    const isImage = allowedImageExtensions.includes(fileExtension)
    
    // Upload to UploadThing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const response = await utapi.uploadFiles([
      {
        name: file.name,
        type: file.type,
        file: buffer,
      }
    ])
    
    if (response[0]?.error) {
      console.error("Upload error:", response[0].error)
      return new NextResponse("Failed to upload file", { status: 500 })
    }
    
    const fileUrl = response[0]?.data?.url
    
    if (!fileUrl) {
      return new NextResponse("Failed to get file URL", { status: 500 })
    }
    
    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      type: isImage ? "IMAGE" : "FILE",
    })
    
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ status: "Upload API is operational" })
} 