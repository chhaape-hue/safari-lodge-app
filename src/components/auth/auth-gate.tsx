"use client"

import { useAuth } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Leaf } from "lucide-react"

/**
 * Wraps protected content. Redirects to /login if not authenticated.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login")
    }
  }, [user, loading, pathname, router])

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4A7C59] rounded-2xl mb-4 animate-pulse">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <p className="text-stone-500 text-sm">Lade...</p>
        </div>
      </div>
    )
  }

  // On login page, just render
  if (pathname === "/login") return <>{children}</>

  // Not authenticated → blank (redirect happening)
  if (!user) return null

  return <>{children}</>
}
