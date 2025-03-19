"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode, useEffect } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Check session status on client side
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session-check')
        const data = await response.json()
        console.log("Client-side session check:", data)
      } catch (error) {
        console.error("Failed to check session:", error)
      }
    }
    
    checkSession()
  }, [])
  
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
} 