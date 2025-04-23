"use client"
import { SessionProvider } from "@/components/SessionProvider"
import { ThemeProvider } from "next-themes"
import { PageTransition } from "@/components/ui/page-transition"
import { SearchParamsProvider } from "./providers/client-search-params"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <SearchParamsProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </SearchParamsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 