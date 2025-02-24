"use client"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { useSession, signOut, SessionProvider } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { metadata } from "./metadata"
import { NavMenu } from "@/components/NavMenu"
import { Providers } from "@/components/Providers"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(inter.className, "min-h-full bg-background")}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <NavMenu />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

import './globals.css'