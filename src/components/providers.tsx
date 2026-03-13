"use client"

/**
 * All client-side providers in one place.
 * - AuthProvider: Supabase session management
 * - SupabaseStoreProvider: live data from Supabase DB
 * - AuthGate: redirects unauthenticated users to /login
 *
 * localStorage StoreProvider has been replaced by SupabaseStoreProvider.
 * The useStore() hook now re-exports from supabase-store for compatibility.
 */

import { AuthProvider } from "@/lib/auth"
import { SupabaseStoreProvider } from "@/lib/supabase-store"
import { AuthGate } from "@/components/auth/auth-gate"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SupabaseStoreProvider>
        <AuthGate>
          {children}
        </AuthGate>
      </SupabaseStoreProvider>
    </AuthProvider>
  )
}
