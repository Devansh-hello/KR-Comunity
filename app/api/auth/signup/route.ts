import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Generate base username from name
    let baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15)
    
    // Check if username exists and append numbers until unique
    let username = baseUsername
    let counter = 1
    while (true) {
      const existing = await prisma.user.findUnique({
        where: { username }
      })
      if (!existing) break
      username = `${baseUsername}${counter}`
      counter++
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
      },
    })

    return NextResponse.json({
      message: "Account created successfully",
      user
    })

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
} 