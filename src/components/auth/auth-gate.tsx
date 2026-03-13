"use client"

import { useAuth } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Leaf } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PUBLIC_PATHS = ["/login", "/set-password"]

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Not logged in → go to login
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login")
      return
    }

    // Logged in → check if session came from an invite (no password set yet)
    if (user && !PUBLIC_PATHS.includes(pathname)) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return
        // amr = authentication method reference
        // "otp" means the user authenticated via invite/magic link, not a password
        const amr = (session as { amr?: { method: string }[] }).amr
        const methods = amr?.map(a => a.method) ?? []
        const usedOtp = methods.includes("otp") && !methods.includes("password")
        if (usedOtp) {
          router.replace("/set-password")
        }
      })
    }
  }, [user, loading, pathname, router])

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

  if (PUBLIC_PATHS.includes(pathname)) return <>{children}</>
  if (!user) return null

  return <>{children}</>
}
