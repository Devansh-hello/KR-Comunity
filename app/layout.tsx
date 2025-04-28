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
import { ModeToggle } from "@/components/ModeToggle"
import { AppLoading } from "@/components/ui/app-loading"
import { Footer } from "@/components/ui/footer"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-full bg-background antialiased")}>
        <Providers>
          <AppLoading />
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 md:h-16 items-center px-4">
                <NavMenu />
              </div>
            </header>
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

import './globals.css'