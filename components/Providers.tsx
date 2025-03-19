"use client"
import { SessionProvider } from "@/components/SessionProvider"
import { ThemeProvider } from "next-themes"
import { PageTransition } from "@/components/ui/page-transition"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <PageTransition>
          {children}
        </PageTransition>
      </ThemeProvider>
    </SessionProvider>
  )
} 