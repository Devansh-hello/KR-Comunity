"use client"

import { ReactNode, Suspense } from "react"
import { useSearchParams as useNextSearchParams } from "next/navigation"

// Context to hold and share search params
export function SearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerSearchParamsProvider>
        {children}
      </InnerSearchParamsProvider>
    </Suspense>
  )
}

// Inner component that uses the hook directly
function InnerSearchParamsProvider({ children }: { children: ReactNode }) {
  // This component safely accesses search params with suspense boundary
  const _ = useNextSearchParams()
  return <>{children}</>
}

// Safe hook to use search params with proper suspense handling
export function useSearchParams() {
  return useNextSearchParams()
}
